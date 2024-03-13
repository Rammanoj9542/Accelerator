import os
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain.vectorstores import Chroma
from chromadb.config import Settings
import logging

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
model_dir = os.path.join(project_directory, "EmbeddingModels")
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


class Model:
    def __init__(self, model_basename = None):
        """
        Initializes the Model object.

        Args:
            model_basename (str, optional): Model file name. Defaults to None.
        """
        self.model_basename = model_basename
        print(self.model_basename)
        # Set the path to the models directory
        self.modelpath = model_dir

        # Load quantized gguf models or handle errors if loading fails
        self.model = self._load_embedding_model()

    def _load_embedding_model(self):
        """
        Loads a embedding model

        Returns:
            model: Loaded embedding model
            error_message (str): Error message if model loading fails, None otherwise.
        """

        try:
            embedding = HuggingFaceInstructEmbeddings(
                cache_folder = self.modelpath,
                model_name = self.model_basename,
                model_kwargs = {"device": "cpu"},
            )
            self.embeddeding = embedding
            return embedding
        except Exception as e:
            # Handle exceptions and provide an error message if model loading fails
            logger.error(f"Error loading embedding model: {e}")
            raise RuntimeError(f"Error loading embedding model: {e}")
        
    def embedded_text(self, text, persist_directory):
        try:
            ingest_db = Chroma.from_documents(
                text,
                self.embeddeding,
                persist_directory = persist_directory,
            )
            if ingest_db:
                return True
            else:
                return False
        except Exception as e:
            logger.error(f"Error ingesting text: {e}")
            raise RuntimeError(f"Error ingesting text: {e}")