from cachetools import TTLCache
from database import MongoDBHandler
from load_stt_model import STTModel
import os

# Initialize a TTL cache with a maximum size of 5000 and a time-to-live (TTL) of 600 seconds (10 minutes)
cache = TTLCache(maxsize=5000, ttl=600)

class GetSTTModel:
    def __init__(self, clientApiKey, modelId, sttId):
        """
        Args:
            clientApiKey (str): Client API key used for authentication.
            modelId (str): Unique identifier for the specific model.
        """
        # Initialize the GetModel class with client API key and model ID
        self.clientApiKey = clientApiKey
        self.sttId = sttId
        self.modelId = modelId
        # Initialize mode and model to None by default
        self.mode = None
        self.model = None
        # Try to retrieve mode and model using the _get_model method
        self._get_model()

    def _get_model(self):
        """
        Fetches model data either from cache or from the database based on clientApiKey and modelId.
        """
        cache_model_key = (self.clientApiKey, self.modelId)
        cached_model_data = cache.get(cache_model_key)

        if cached_model_data:
            # If model data is found in the cache, set mode and model
            self.mode, self.model = cached_model_data
            print("Getting Cached Model Data")
        else:
            try:
                # Fetch model details from the database using client API key and model ID
                config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.yaml'))
                mongodb_handler = MongoDBHandler(config_path)

                mode = mongodb_handler.get_stt_mode_details(self.clientApiKey, self.sttId)
                model = mongodb_handler.get_stt_model_details(self.clientApiKey, self.modelId)

                self.mode = mode
                self.model = STTModel(
                    model_id = model
                )
            except Exception as e:
                # Set mode and model to None if an exception occurs during model initialization
                self.mode = None
                self.model = None
                print(f"Error fetching model details: {e}")

    def get_stt_model_data(self):
        """
        Retrieves the mode and model data.

        Returns:
            str: Mode of the model ('translate' or 'transcribe').
            Model: Instance of the Model class representing the specific model.
            str: Error message if there was an error during model initialization, otherwise None.
        """
        # Public method to get mode, model data, and error message
        if self.mode and self.model:
            return self.mode, self.model, None
        else:
            return "","", "Error initializing model."

