from database import MongoDBHandler
import os

class GetPromptDetails:
    def __init__(self, clientApiKey, promptId):
        """
        Constructor for GetPromptDetails class.
        
        Args:
            clientApiKey (str): API key for authentication.
            promptId (int): Unique identifier for the prompt.
        """
        self.clientApiKey = clientApiKey
        self.promptId = promptId
        self.error_message = None

        try:
            # Try to retrieve prompt details, either from cache or database.
            self.promptDetails = self._get_prompt_details()
        except Exception as e:
            # If an error occurs during initialization, store the error message.
            self.error_message = f"Error occurred: {e}"
            self.promptDetails = None

    def _get_prompt_details(self):
        """
        Private method to retrieve prompt details, either from cache or database.
        
        Returns:
            dict: Prompt details retrieved from cache or database.
            
        Raises:
            Exception: If an error occurs during cache retrieval or database retrieval.
        """

        try:
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'config.yaml'))
            mongodb_handler = MongoDBHandler(config_path)

            # If prompt details are not in the cache, retrieve them from the database.
            promptDetails = mongodb_handler.getPromptDetails(self.clientApiKey, self.promptId)
            # Store the retrieved details in the cache for future use.
            return promptDetails
        except Exception as e:
            # If an error occurs during database retrieval, store the error message and raise the exception.
            self.error_message = f"Error occurred while fetching prompt details: {e}"
            raise

    def get_prompt_details(self):
        """
        Method to get the prompt details.
        
        Returns:
            dict: Prompt details retrieved from the cache or database.
        """
        return self.promptDetails

    def get_error_message(self):
        """
        Method to get the error message, if any, encountered during initialization.
        
        Returns:
            str: Error message if an error occurred during initialization, otherwise None.
        """
        return self.error_message
