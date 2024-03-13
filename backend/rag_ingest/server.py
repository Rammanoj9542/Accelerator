# Import necessary modules and classes
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from get_model import GetEmbeddingModel
from get_ingest_data import GetIngestData
from load_documents import DocumentLoader
from split_documents import DocumentSplitter
from cachetools import TTLCache
from database import *

# Set up logging
current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
data_dir = os.path.join(project_directory, "data")
logdir = os.path.join(project_directory, "rag_ingest")
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
cache = TTLCache(maxsize=5000, ttl=600)

# Set up rate limiting and exception handling for RateLimitExceeded error
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# API endpoint for processing requests
@app.post('/rag/ingest')
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        # Extract data from JSON request and log the received data
        clientApiKey = json_data['clientApiKey']
        embeddingModelId = json_data['embeddingModelId']
        ingestId = json_data['ingestId']
        source_directory  = json_data['sourceDirectory']
        source_directory = os.path.join(data_dir, source_directory)
        persist_directory  = json_data['persistDirectory']
        persist_directory = os.path.join(data_dir, persist_directory)
        userId = json_data['userId']
        uniqueId = clientApiKey + userId

        logger.info(f"Received request data: Client API Key: {clientApiKey}, Embedding Model ID: {embeddingModelId}, Source Directory: {source_directory}, Persist Directory: {persist_directory} ,User ID: {userId}")

        cache_model_key = (clientApiKey, embeddingModelId)
        cached_model_data = cache.get(cache_model_key)


        if cached_model_data:
            # If model data is found in the cache, set mode and model
            model = cached_model_data
            print("Getting Cached Model Data")
        else:
            # Retrieve model data from GetModel class
            model_instance = GetEmbeddingModel(clientApiKey, embeddingModelId)
            model, error_message = model_instance.get_model_data()
            cache[cache_model_key] = (model)
            if not error_message:
                logger.info("Successfully retrieved model details.")
            else:
                logging.error(error_message)
                raise HTTPException(status_code=500, detail=error_message)
            
        if model:
            document_loader = DocumentLoader(source_directory)
            all_documents = document_loader.load_documents()
            text_documents, python_documents = DocumentLoader.split_documents(all_documents)
        else:
            logger.error("Embedding Model Not Loaded")
            raise HTTPException(status_code=500, detail="Embedding Model Not Loaded")

        if text_documents:
            cache_ingest_key = (clientApiKey, ingestId)
            cached_ingest_data = cache.get(cache_ingest_key)

            if cached_ingest_data:
                # If model data is found in the cache, set ingest config
                ingest_config = cached_ingest_data
                print("Getting Cached Ingest Config")
            else:
                # Retrieve model data from GetModel class
                ingest_instance = GetIngestData(clientApiKey, ingestId)
                ingest_config, error_message = ingest_instance.get_ingest_data()
                cache[cache_ingest_key] = (ingest_config)
                if not error_message:
                    logger.info("Successfully retrieved ingest config.")
                else:
                    logging.error(error_message)
                    raise HTTPException(status_code=500, detail=error_message)
        else:
            logger.error("Text Documents not loaded")
            raise HTTPException(status_code=500, detail="Text Documents not loaded")
        
        if ingest_config:
            document_splitter = DocumentSplitter(ingest_config)
            text = document_splitter.split_documents(text_documents)
        else:
            logger.error("Ingest Config not loaded")
            raise HTTPException(status_code=500, detail="Ingest Config not loaded")
        
        if text:
            embedded_text = model.embedded_text(text = text, persist_directory = persist_directory)
            if embedded_text:
                return "Ingest Done Successfully" 
            else:
                logger.error("Ingest Failed")
                raise HTTPException(status_code=500, detail="Ingest Failed")
        else:
            logger.error("Text not splitted")
            raise HTTPException(status_code=500, detail="Text not splitted")

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
    uvicorn.run("server:app", host="0.0.0.0" ,port=7001,reload=True)