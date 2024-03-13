import os
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.prompts.prompt import PromptTemplate
import logging

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "llm_openai_cloud")
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
    def __init__(self, modeltype, env_variable = None, model_basename = None):
        """
        Initializes the Model object.

        Args:
            modeltype (str): Type of the model, either 'OpenAI' or other model types.
            env_variable (str, optional): Environment variable name for OpenAI API key. Defaults to None.
            model_basename (str, optional): Model file name. Defaults to None.
        """

        self.model_basename = model_basename
        # Retrieve API key from environment variable and set it for OpenAI API access
        self.api_key = os.getenv(env_variable)
        os.environ["OPENAI_API_KEY"] = self.api_key
        # Load OpenAI model or handle errors if loading fails
        self.model = self._load_open_ai_model()

    def _load_open_ai_model(self):
        """
        Loads the OpenAI model for chat-based language generation.

        Returns:
            model: Loaded OpenAI model for chat-based language generation.
            error_message (str): Error message if model loading fails, None otherwise.
        """
        try:
            # Attempt to create a ChatOpenAI instance with specified temperature and model basename
            model = ChatOpenAI(temperature=0.0, model=self.model_basename)
            # Return the loaded OpenAI model and None for the error message if successful
            return model
        except Exception as e:
            # Handle exceptions and provide an error message if model loading fails
            logger.error(f"Error loading OpenAI model: {e}")
            # Return None for the model and the error message if loading fails
            raise RuntimeError(f"Error loading OpenAI model: {e}")

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
