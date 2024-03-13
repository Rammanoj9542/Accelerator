# Import necessary modules and classes
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from get_prompt import GetPromptDetails
from get_model import GetModel
from prompt_template import PromptInitializer
from response import GenerateResponse
from cachetools import TTLCache
from database import *

# Set up logging
current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "local_gptq")
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
@app.post('/llm/server')
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        # Extract data from JSON request and log the received data
        clientApiKey = json_data['clientApiKey']
        modelId = json_data['modelId']
        promptId = json_data['promptId']
        userId = json_data['userId']
        uniqueId = clientApiKey + userId

        logger.info(f"Received request data: Client API Key: {clientApiKey}, Model ID: {modelId}, Prompt ID: {promptId}, User ID: {userId}")

        cache_model_key = (clientApiKey, modelId)
        cached_model_data = cache.get(cache_model_key)

        if cached_model_data:
            # If model data is found in the cache, set mode and model
            mode, model = cached_model_data
            print("Getting Cached Model Data")
        else:
            # Retrieve model data from GetModel class
            model_instance = GetModel(clientApiKey, modelId)
            mode, model, error_message = model_instance.get_model_data()
            cache[cache_model_key] = (mode, model)
            if not error_message:
                logger.info("Successfully retrieved model details.")
            else:
                logging.error(error_message)
                raise HTTPException(status_code=500, detail=error_message)


        # Retrieve prompt details from GetPromptDetails class
        cache_prompt_key = (clientApiKey, promptId)
        cached_prompt_data = cache.get(cache_prompt_key)

        if cached_prompt_data:
            # If prompt details are found in the cache, set the prompt_details_instance.
            prompt_details_instance = cached_prompt_data
        else: 
            prompt_details_instance = GetPromptDetails(clientApiKey, promptId)
        
        if prompt_details_instance.get_error_message():
            error_message = prompt_details_instance.get_error_message()
            logging.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)
        else:
            prompt_details = prompt_details_instance.get_prompt_details()
            logger.info("Successfully retrieved model and prompt details.")

        # Handle different app and prompt types
        if prompt_details.get('appType') == "simple":
            if prompt_details.get('promptType') == "simple":
                simple_prompt = prompt_details.get('simplePrompt')

                # Initialize and format simple prompt using PromptInitializer class
                prompt_initializer = PromptInitializer(prompt=simple_prompt)
                formatted_prompt, error_message  = prompt_initializer.initialize_prompt(json_data)

                if error_message:
                    logging.error(error_message)
                    raise HTTPException(status_code=500, detail=error_message)
                else:
                    logger.info("Successfully Prompt Formated")

                if formatted_prompt:
                    # Generate response for simple prompt using GenerateResponse class and log the response
                    simple_response = GenerateResponse(mode=mode,
                                                       model=model,
                                                       simplePrompt=formatted_prompt,
                                                       appType='simple',
                                                       promptType='simple'
                                                       )
                    if simple_response.error:
                        logger.error(f"Error in generating response: {simple_response.error}")
                        raise HTTPException(status_code=500, detail="Error in generating response.")
                    else:
                        generated_response = simple_response.response
                        print(generated_response)
                        logger.info("Generated response for simple prompt.")
                        return generated_response
                else:
                    # Raise HTTPException with 500 status code and log the error
                    logger.error("Failed to initialize simple prompt.")
                    raise HTTPException(status_code=500, detail="Failed to initialize prompt.")

        elif prompt_details.get('appType') == "conversational":
            if prompt_details.get('promptType') == "system":
                # Extract system and human messages from prompt details
                inputData = prompt_details.get('inputData')
                memoryType = prompt_details.get('memoryType')
                system_message = prompt_details.get('systemMessage')
                human_message = prompt_details.get('humanMessage')

                # Initialize and format system message using PromptInitializer class
                prompt_initializer = PromptInitializer(prompt=system_message)
                SystemMessage, error_message = prompt_initializer.initialize_prompt(inputData)

                if error_message:
                    logging.error(error_message)
                    raise HTTPException(status_code=500, detail=error_message)
                else:
                    logger.info("Successfully SystemMessage Formated")

                # Initialize and format human message using PromptInitializer class
                prompt_initializer = PromptInitializer(prompt=human_message)
                HumanMessage, error = prompt_initializer.initialize_prompt(json_data)
                if error_message:
                    logging.error(error_message)
                    raise HTTPException(status_code=500, detail=error_message)
                else:
                    logger.info("Successfully HumanMessage Formated")

                if SystemMessage and HumanMessage:
                    # Generate conversational response using GenerateResponse class and log the response
                    conversational_response = GenerateResponse(mode = mode,
                                                               model = model,
                                                               systemMessage = SystemMessage[0].content,
                                                               humanMessage = HumanMessage[0].content,
                                                               appType = 'conversational',
                                                               promptType = 'system',
                                                               uniqueId = uniqueId,
                                                               memoryType = memoryType
                                                               )
                    if conversational_response.error:
                        logger.error(f"Error in generating chat response: {conversational_response.error}")
                        raise HTTPException(status_code=500, detail="Error in generating chat response.")
                    else:
                        generated_response = conversational_response.response
                        logger.info("Generated response for conversational prompt.")
                        return generated_response
                else:
                    # Raise HTTPException with 500 status code and log the error
                    logger.error("Failed to initialize conversational prompt.")
                    raise HTTPException(status_code=500, detail="Failed to initialize prompt.")

    except HTTPException as he:
        # If an HTTPException is raised, propagate it with the same status code and details
        logger.warning(f"HTTPException occurred: {he}")
        raise he
    except Exception as e:
        # Log the error using logging module, raise HTTPException with 500 status code and log the error
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post('/llm/resetchat')
async def reset_chat(json_data: dict, request: Request, response: Response):
    try:
        clientApiKey = json_data['clientApiKey']
        userId = json_data['userId']
        uniqueId = clientApiKey + userId

        # Create an instance of GenerateResponse class
        response_generator = GenerateResponse(uniqueId=uniqueId)

        if response_generator.error:
            logger.error(f"Error in resetting chat: {response_generator.error}")
            raise HTTPException(status_code=500, detail="Error in resetting chart.")
        else:
            reset_result = response_generator._reset_chart()
            logger.info("Chart Reset successfully")
            return {"message": "Chart reset successful."}

    except HTTPException as he:
        logger.error(f"HTTP Exception occurred: {he.detail}")
        raise he
    except Exception as e:
        logger.exception(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0" ,port=6004,reload=True)