from database import MongoDBHandler
import os


class GetRetrivalData:
    def __init__(self, clientApiKey, retrivalId):
        """
        Args:
            clientApiKey (str): Client API key used for authentication.
            retrivalId (str): Unique identifier for the specific retrival config.
        """
        # Initialize the GetRetrivalData class with client API key and retrival ID
        self.clientApiKey = clientApiKey
        self.retrivalId = retrivalId
        # Initialize retrival_config to None by default
        self.retrival_config = None
        # Try to retrieve retrival config using the _get_retrival_config method
        self._get_retrival_config()

    def _get_retrival_config(self):
        """
        Fetches retrival config from the database based on clientApiKey and retrivalId.
        """
        try:
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.yaml'))
            mongodb_handler = MongoDBHandler(config_path)

            # Fetch retrival config from the database using client API key and Retrival ID
            retrivalConfig = mongodb_handler.getRetrivalConfig(self.clientApiKey, self.retrivalId)

            self.retrival_config = retrivalConfig
                
        except Exception as e:
            # Set retrival config to None if an exception occurs during model initialization
            self.retrival_config = None
            print(f"Error fetching retrival config: {e}")

    def get_retrival_data(self):
        """
        Retrieves the retrival data.

        Returns:
            dict: Retrival Config retrieved from the database.
            str: Error message if there was an error during fetching retrival config, otherwise None.
        """
        # Public method to get mode, model data, and error message
        if self.retrival_config:
            return self.retrival_config, None
        else:
            return "", "Error fetching retrival config"

