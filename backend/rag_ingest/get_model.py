from database import MongoDBHandler
from load_model import Model
import os


class GetEmbeddingModel:
    def __init__(self, clientApiKey, modelId):
        """
        Args:
            clientApiKey (str): Client API key used for authentication.
            modelId (str): Unique identifier for the specific model.
        """
        # Initialize the GetModel class with client API key and model ID
        self.clientApiKey = clientApiKey
        self.modelId = modelId
        # Initialize model to None by default
        self.model = None
        # Try to retrieve mode and model using the _get_model method
        self._get_model()

    def _get_model(self):
        """
        Fetches model data from the database based on clientApiKey and modelId.
        """
        try:
            # Fetch model details from the database using client API key and model ID
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.yaml'))
            mongodb_handler = MongoDBHandler(config_path)

            # Fetch model details from the database using client API key and model ID
            modelDetails = mongodb_handler.getEmbeddingModelDetails(self.clientApiKey, self.modelId)
            modelName = modelDetails.get('modelName')

            # Initialize cloud model with appropriate parameters
            self.model = Model(
                model_basename = modelName
            )
                

        except Exception as e:
            # Set model to None if an exception occurs during model initialization
            self.model = None
            print(f"Error fetching model details: {e}")

    def get_model_data(self):
        """
        Retrieves the model data.

        Returns:
            Model: Instance of the Model class representing the specific model.
            str: Error message if there was an error during model initialization, otherwise None.
        """
        # Public method to get mode, model data, and error message
        if self.model:
            return self.model, None
        else:
            return "", "Error initializing model."
        
    

