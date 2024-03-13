import os
from langchain.chat_models import ChatOpenAI
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain.retrievers import ContextualCompressionRetriever
import logging

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..",  "..")
logdir = os.path.join(project_directory, "rag_retrival")
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

    def compressor(self, vectordb, question):
        print(vectordb)
        compressor = LLMChainExtractor.from_llm(self.model)
        compression_retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=vectordb.as_retriever()
        )
        response = compression_retriever.get_relevant_documents(question)
        return response    

        

    