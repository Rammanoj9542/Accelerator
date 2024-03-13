import whisper
import os
import logging

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "stt_wispher")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


class STTModel:
    def __init__(self, model_id = None, deviceType = 'cpu'):
        """
        Initializes the Model object.

        Args:
            modeltype (str): Type of the model, either 'OpenAI' or other model types.
            model_id (str, optional): Model identifier. Defaults to None.
            env_variable (str, optional): Environment variable name for OpenAI API key. Defaults to None.
            model_basename (str, optional): Model file name. Defaults to None.
            deployment (str, optional): Deployment type, 'FastApi' or 'VLLM'. Defaults to None.
            deviceType (str, optional): Device type for model execution, 'cpu', 'cuda', or 'mps'. Defaults to 'cpu'.
        """
        # Initialize instance variables based on input arguments
        self.model_id = model_id
        
        self.model = self._load_stt_model()

    def _load_stt_model(self):
        """
        Loads the OpenAI model for chat-based language generation.

        Returns:
            model: Loaded OpenAI model for chat-based language generation.
            error_message (str): Error message if model loading fails, None otherwise.
        """
        try:
            # Attempt to create a ChatOpenAI instance with specified temperature and model basename
            model = whisper.load_model(self.model_id)
            # Return the loaded OpenAI model and None for the error message if successful
            return model
        except Exception as e:
            # Handle exceptions and provide an error message if model loading fails
            logger.error(f"Error loading OpenAI model: {e}")
            # Return None for the model and the error message if loading fails
            raise RuntimeError(f"Error loading OpenAI model: {e}")


    
    def translate(self, input_file):
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
            transcription_result = self.model.transcribe(input_file)
            text = transcription_result.get("text", "")
            # Implement any additional processing if needed

            # Return the generated response along with None error message
            return text, None
        except FileNotFoundError as e:
            logger.log(f"An error occurred during transcription file: {e}")
            return "", f"Error: File not found: {e}"
        except whisper.WhisperException as we:
            logger.log(f"An error occurred during transcription file: {we}")
            return "", f"WhisperException: {we}"
        except Exception as e:
            logger.log(f"An error occurred during transcription file: {e}")
            return "", f"Error during transcription: {str(e)}"
