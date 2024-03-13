import os
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain.vectorstores import Chroma
import logging
from cachetools import TTLCache
from chromadb.config import Settings


current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..",  "..")
model_dir = os.path.join(project_directory, "EmbeddingModels")
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

cache = TTLCache(maxsize=5000, ttl=600)


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
        
    def initializing_vectordb(self, clientApiKey, embeddedingModelId, persist_directory):
        embedding = self.embeddeding
        persist_directory = persist_directory
        cache_vectordb_key = (clientApiKey, embeddedingModelId, persist_directory)
        cached_vectordb_data = cache.get(cache_vectordb_key)

        if cached_vectordb_data:
            self.vectordb = cached_vectordb_data
            print("Getting Cached Retrival Config")
        else:
            self.vectordb = Chroma(
                persist_directory = persist_directory,
                embedding_function = embedding
            )
            cache[cache_vectordb_key] = (self.vectordb)
        return self.vectordb
        
    def similaritySearch(self, retrivalConfig, question):
        """
        Retrieves the retrival config.

        Returns:
            dict: Retrived Data from the Vector DB.
            str: Error message if there was an error during retriving data, otherwise None.
        """
        # Public method to get mode, model data, and error message
        question = question
        k_value = retrivalConfig.get('k')
    
        vectordb = self.vectordb
        print(vectordb)
        response = vectordb.similarity_search(question, k=k_value)
        print(response)
        return response
    
    def maxMariginalRelevenceSearch(self,retrivalConfig, question):
        """
        Retrieves the retrival config.

        Returns:
            dict: Retrived Data from the Vector DB.
            str: Error message if there was an error during retriving data, otherwise None.
        """
        # Public method to get mode, model data, and error message
        question = question
        k_value = retrivalConfig.get('k')
        fetch_k = retrivalConfig.get('fetch_k')
        
        vectordb = self.vectordb
        response = vectordb.max_marginal_relevance_search(question, k=k_value, fetch_k=fetch_k)
        print(response)
        return response
    
    def contextCompressionRetriver(self, llm_model, question):
        """
        Retrieves the retrival config.

        Returns:
            dict: Retrived Data from the Vector DB.
            str: Error message if there was an error during retriving data, otherwise None.
        """
        # Public method to get mode, model data, and error message
        llm = llm_model
        question = question

        vectordb = self.vectordb
        compression_retriever = llm.compressor(vectordb, question)
        return compression_retriever


        

    