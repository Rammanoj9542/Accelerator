# Import necessary modules and classes
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from get_embedding_model import GetEmbeddingModel
from get_llm_model import GetModel
from get_retrival_data import GetRetrivalData
from cachetools import TTLCache
from database import *

# Set up logging
current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
data_dir = os.path.join(project_directory, "data")
logdir = os.path.join(project_directory, "rag_retrivel")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Set rate limiter settings
times = "1000"
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI()

# Initialize cache
cache = TTLCache(maxsize=25000, ttl=600)

# Set up rate limiting and exception handling for RateLimitExceeded error
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# API endpoint for processing requests
@app.post('/rag/retrival')
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        # Extract data from JSON request and log the received data
        clientApiKey = json_data['clientApiKey']
        embeddingModelId = json_data['embeddingModelId']
        retrivalId = json_data['retrivalId']
        question = json_data['question']
        persist_directory  = json_data['persistDirectory']
        persist_directory = os.path.join(data_dir, persist_directory)
        userId = json_data['userId']
        uniqueId = clientApiKey + userId

        logger.info(f"Received request data: Client API Key: {clientApiKey}, Embedding Model ID: {embeddingModelId}, Persist Directory: {persist_directory} ,User ID: {userId}")

        cache_embedding_model_key = ("embeddingModel",clientApiKey, embeddingModelId)
        cached_embedding_model_data = cache.get(cache_embedding_model_key)


        if cached_embedding_model_data:
            # If model data is found in the cache, set the model
            embedding_model = cached_embedding_model_data
            print("Getting Cached Embedding Model Data")
        else:
            # Retrieve model data from GetEmbeddingModel class
            embedding_model_instance = GetEmbeddingModel(clientApiKey, embeddingModelId)
            embedding_model, error_message = embedding_model_instance.get_emebdding_model_data()
            cache[cache_embedding_model_key] = (embedding_model)
            if not error_message:
                logger.info("Successfully retrieved embedding model details.")
            else:
                logging.error(error_message)
                raise HTTPException(status_code=500, detail=error_message)
            
        if embedding_model:
            cache_retrival_key = ("RetrivalConfig",clientApiKey, retrivalId)
            cached_retrival_data = cache.get(cache_retrival_key)

            if cached_retrival_data:
                # If model data is found in the cache, set retrival config
                retrival_config = cached_retrival_data
                print("Getting Cached Retrival Config")
            else:
                # Retrieve model data from GetModel class
                retrival_instance = GetRetrivalData(clientApiKey, retrivalId)
                retrival_config, error_message = retrival_instance.get_retrival_data()
                cache[cache_retrival_key] = (retrival_config)
                if not error_message:
                    logger.info("Successfully retrieved retrival config.")
                else:
                    logging.error(error_message)
                    raise HTTPException(status_code=500, detail=error_message)
        else:
            logger.error("Embedding Model Not Loaded")
            raise HTTPException(status_code=500, detail="Embedding Model Not Loaded")

        
        
        if retrival_config:
            retrivalType = retrival_config.get("retrivalType")
            if retrivalType == "similaritySearch":
                db = embedding_model.initializing_vectordb(clientApiKey, embedding_model, persist_directory)
                response = embedding_model.similaritySearch(retrival_config, question)
            elif retrivalType == "maxMariginalRelevenceSearch":
                db = embedding_model.initializing_vectordb(clientApiKey, embedding_model, persist_directory)
                response = embedding_model.maxMariginalRelevenceSearch(retrival_config, question)
            # elif retrivalType == "selfQueryRetriver":
            #     retrival = selfQueryRetriver(model, retrival_config)
            #     response = retrival.get_retrival_response()
            elif retrivalType == "contextCompressionRetriver":
                llm_modelId = retrival_config.get("llm_modelId")
                cache_llm_model_key = (clientApiKey, llm_modelId)
                cached_llm_model_data = cache.get(cache_llm_model_key)

                if cached_llm_model_data:
                    # If model data is found in the cache, set mode and model
                    llm_model = cached_llm_model_data
                    print("Getting Cached Model Data")
                else:
                    # Retrieve model data from GetModel class
                    llm_model_instance = GetModel(clientApiKey, llm_modelId)
                    llm_model, error_message = llm_model_instance.get_model_data()
                    cache[cache_llm_model_key] = (llm_model)
                db = embedding_model.initializing_vectordb(clientApiKey, embedding_model, persist_directory)
                answer = embedding_model.contextCompressionRetriver(llm_model, question)
                response = answer[0].page_content
                return {"result": response}
        else:
            logger.error("Ingest Config not loaded")
            raise HTTPException(status_code=500, detail="Retrival Config not loaded")
        
        

    except HTTPException as he:
        # If an HTTPException is raised, propagate it with the same status code and details
        logger.warning(f"HTTPException occurred: {he}")
        raise he
    except Exception as e:
        # Log the error using logging module, raise HTTPException with 500 status code and log the error
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0" ,port=7002,reload=True)