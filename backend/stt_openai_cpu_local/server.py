# Import necessary modules and classes
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from get_stt_model import GetSTTModel
from cachetools import TTLCache
from database import *

# Set up logging
current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "stt_openai_cpu_local")
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
@app.post('/stt/server')
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        print(json_data)
        # Extract data from JSON request and log the received data
        clientApiKey = json_data['clientApiKey']
        modelId = json_data['modelId']
        sttId = json_data['sttId']
        input_file = json_data['input_file']

        logger.info(f"Received request data: Client API Key: {clientApiKey}, Model ID: {modelId}, STT ID: {sttId}")

        # Retrieve model data from GetSTTModel class
        model_instance = GetSTTModel(clientApiKey, modelId = modelId, sttId = sttId)
        mode, model, error_message = model_instance.get_stt_model_data()

        if not error_message:
            logger.info("Successfully retrieved model details.")
        else:
            logging.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)
        
        text_result, error_message = model.translate(input_file = input_file)
        if not error_message:
            logging.info(f"Transcription successful for input file '{input_file}'.")
            return {"result": text_result}
        else:
            logging.error(f"{error_message}")
            raise HTTPException(status_code=500, detail=error_message)


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
    uvicorn.run("server:app", host="0.0.0.0" ,port=5005, reload=True)