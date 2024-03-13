# Import necessary modules and classes
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from cachetools import TTLCache
from database import *
import requests

# Set up logging
current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "server")
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
cache = TTLCache(maxsize=50000, ttl=600)

# Set up rate limiting and exception handling for RateLimitExceeded error
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# API endpoint for processing requests
@app.post('/accelerator/server')
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        # Extract data from JSON request and log the received data
        clientApiKey = json_data['clientApiKey']
        deploymentId = json_data['deployId']
        json_data.pop("clientApiKey")
        json_data.pop("deployId")

        logger.info(f"Received request data: Client API Key: {clientApiKey}, Deploy ID: {deploymentId}")

        cache_deployment_config_key = ("deploymnet",clientApiKey, deploymentId)
        cached_deployment_data = cache.get(cache_deployment_config_key)


        if cached_deployment_data:
            # If model data is found in the cache, set the model
            deploymentDetails = cached_deployment_data
            print("Getting Cached Deployment Data")
        else:
            # Retrieve deployment details from database
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.yaml'))
            mongodb_handler = MongoDBHandler(config_path)
            deploymentDetails, error_message = mongodb_handler.deployment_details(clientApiKey, deploymentId)
            cache[cache_deployment_config_key] = (deploymentDetails)
            if not error_message:
                logger.info("Successfully retrieved deployment details.")
            else:
                logging.error(error_message)
                raise HTTPException(status_code=500, detail=error_message)

        sericveUrl = deploymentDetails["serviceUrl"]
        json_data.update(deploymentDetails)
        json_data.pop("serviceUrl")
        del deploymentDetails
        
        response = requests.post(sericveUrl, json = json_data)
        if response.status_code == 200:
                response = response.json()["result"]
                print(response)
        return {"response": response}

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
    uvicorn.run("server:app", host="0.0.0.0" ,port=4001, reload=True)