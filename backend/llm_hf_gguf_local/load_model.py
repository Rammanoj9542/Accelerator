import os
from huggingface_hub import hf_hub_download
from langchain.chains import ConversationChain
from langchain.prompts.prompt import PromptTemplate
from langchain.llms import LlamaCpp
import logging

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "local_gguf")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


class Model:
    def __init__(self, modeltype, model_id = None, model_basename = None):
        """
        Initializes the Model object.

        Args:
            modeltype (str): Type of the model, either 'OpenAI' or other model types.
            model_id (str, optional): Environment variable name for OpenAI API key. Defaults to None.
            model_basename (str, optional): Model file name. Defaults to None.
        """
        self.model_id = model_id
        self.model_basename = model_basename
        # Set the path to the models directory
        self.modelpath = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))

        # Load quantized gguf models or handle errors if loading fails
        self.model = self._load_quantized_model_gguf()

    def _load_quantized_model_gguf(self):
        """
        Loads a quantized GGUF (Generic GPU Unfriendly) model for language generation.

        Returns:
            model: Loaded quantized GGUF model for language generation.
            error_message (str): Error message if model loading fails, None otherwise.
        """

        try:
            CONTEXT_WINDOW_SIZE = 4096
            MAX_NEW_TOKENS = CONTEXT_WINDOW_SIZE
            N_BATCH = 512  
            model_path = hf_hub_download(
                repo_id = self.model_id,
                filename = self.model_basename,
                resume_download = True,
                cache_dir = self.modelpath,
            )
            kwargs = {
                "model_path": model_path,
                "n_ctx": CONTEXT_WINDOW_SIZE,
                "max_tokens": MAX_NEW_TOKENS,
                "n_batch": N_BATCH,  # set this based on your GPU & CPU RAM
            }
            print(LlamaCpp(**kwargs))
            return LlamaCpp(**kwargs)
        except Exception as e:
            # Handle exceptions and provide an error message if model loading fails
            logger.error(f"Error loading GGUF quantized model: {e}")
            raise RuntimeError(f"Error loading GGUF quantized model: {e}")


    def generate_response(self, prompt):
        """
        Generates a response based on the given prompt using the loaded model.

        Args:
            prompt (str): Input prompt for generating the response.

        Returns:
            response: Generated response based on the input prompt.
            error_message (str): Error message if response generation fails, None otherwise.
        """
        try:
            # Generate response using the loaded model with the provided prompt
            response = self.model(prompt)
            # Implement any additional processing if needed

            # Return the generated response along with None error message
            return response
        except Exception as e:
            logger.log(f"An error occurred during response generation: {e}")
            raise RuntimeError(f"An error occurred during response generation: {e}")

        
    def generate_conversational_response(self, promptType, memoryhistory, humanMessage, systemTemplate=None):
        """
        Generates a conversational response based on the given input parameters.

        Args:
            promptType (str): Type of prompt, either 'system' or 'simple'.
            memoryhistory (list): List of previous conversation history.
            humanMessage (str): User's input message.
            systemTemplate (str, optional): System-level prompt template. Defaults to None.

        Returns:
            response: Generated conversational response.
            updated_memoryhistory (list): Updated conversation history after processing the input.
            error_message (str): Error message if response generation fails, None otherwise.
        """
        try:
            # Check the type of prompt and create a ConversationChain instance accordingly
            if promptType == 'system':
                # If promptType is 'system', create a ConversationChain with system-level template
                cov = ConversationChain(
                    llm=self.model,
                    memory=memoryhistory,
                    prompt=PromptTemplate(input_variables=["history", "input"], template=systemTemplate),
                    verbose=True
                )
            elif promptType == 'simple':
                # If promptType is 'simple', create a ConversationChain without system-level template
                cov = ConversationChain(
                    llm=self.model,
                    memory=memoryhistory,
                    verbose=True
                )

            # Predict the response based on the input humanMessage using the ConversationChain
            response = cov.predict(input=humanMessage)

            # Return the generated response, updated conversation history, and None error message
            return response, memoryhistory

        except Exception as e:
            # Handle exceptions and provide an error message if response generation fails
            logger.error(f"An error occurred during conversational response generation: {e}")
            raise RuntimeError(f"An error occurred during conversational response generation: {e}")
