from database import MongoDBHandler
from LoadModels.load_embedding_models import *
import os


class GetEmbeddingModel:
    def __init__(self, clientApiKey, embeddingModelId):
        """
        Args:
            clientApiKey (str): Client API key used for authentication.
            embeddingModelId (str): Unique identifier for the specific embedding model.
        """
        # Initialize the GetModel class with client API key and embedding model ID
        self.clientApiKey = clientApiKey
        self.embeddingModelId = embeddingModelId
        # Initialize model to None by default
        self.embeddingModel = None
        # Try to retrieve embedding model using the _get_embedding_model method
        self._get_embedding_model()

    def _get_embedding_model(self):
        """
        Fetches embedding model data from the database based on clientApiKey and embeddingModelId.
        """
        try:
            # Fetch embedding model details from the database using client API key and embedding model ID
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.yaml'))
            mongodb_handler = MongoDBHandler(config_path)

            # Fetch model details from the database using client API key and embedding model ID
            modelDetails = mongodb_handler.getEmbeddingModelDetails(self.clientApiKey, self.embeddingModelId)
            embeddingModelName = modelDetails.get('modelName')

            # Initialize cloud model with appropriate parameters
            self.embeddingModel = Model(
                model_basename = embeddingModelName
            )
                

        except Exception as e:
            # Set model to None if an exception occurs during model initialization
            self.embeddingModel = None
            print(f"Error fetching embedding model details: {e}")

    def get_emebdding_model_data(self):
        """
        Retrieves the model data.

        Returns:
            Model: Instance of the Model class representing the specific model.
            str: Error message if there was an error during model initialization, otherwise None.
        """
        # Public method to get mode, model data, and error message
        if self.embeddingModel:
            return self.embeddingModel, None
        else:
            return "", "Error initializing model."
        
    

