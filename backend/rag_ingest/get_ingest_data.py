from database import MongoDBHandler
import os


class GetIngestData:
    def __init__(self, clientApiKey, ingestId):
        """
        Args:
            clientApiKey (str): Client API key used for authentication.
            ingestId (str): Unique identifier for the specific ingest config.
        """
        # Initialize the GetIngestData class with client API key and ingest ID
        self.clientApiKey = clientApiKey
        self.ingestId = ingestId
        # Initialize ingest_config to None by default
        self.ingest_config = None
        # Try to retrieve ingest config using the _get_ingest_config method
        self._get_ingest_config()

    def _get_ingest_config(self):
        """
        Fetches ingest config from the database based on clientApiKey and ingestId.
        """
        try:
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.yaml'))
            mongodb_handler = MongoDBHandler(config_path)

            # Fetch ingest config from the database using client API key and Ingest ID
            ingestConfig = mongodb_handler.getIngestConfig(self.clientApiKey, self.ingestId)

            self.ingest_config = ingestConfig
                
        except Exception as e:
            # Set ingest config to None if an exception occurs during model initialization
            self.ingest_config = None
            print(f"Error fetching ingest config: {e}")

    def get_ingest_data(self):
        """
        Retrieves the ingest data.

        Returns:
            dict: Ingest Config retrieved from the database.
            str: Error message if there was an error during fetching ingest config, otherwise None.
        """
        # Public method to get mode, model data, and error message
        if self.ingest_config:
            return self.ingest_config, None
        else:
            return "", "Error fetching ingest config"

