from pymongo.mongo_client import MongoClient
import yaml

class MongoDBHandler:
    def __init__(self, config_path):
        self.config_path = config_path
        self._load_config()
        self._connect_to_mongodb()

    def _load_config(self):
        with open(self.config_path, 'r') as config_file:
            config_data = yaml.safe_load(config_file)
            self.db_uri = config_data.get("db_url")
    
    def _connect_to_mongodb(self):
        self.client = MongoClient(self.db_uri)

        # Send a ping to confirm a successful connection
        try:
            self.client.admin.command('ping')
            print("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            print(e)

    def getLlmModelDetails(self, clientApiKey, modelId):
        try:
            db = self.client["aiAccelerator"]
            LLMModels = db["LLMModels"]
            model_details_cursor = LLMModels.find_one(
                {"clientApiKey": clientApiKey, "modelId": modelId},
                {"clientApiKey": 0, "_id": 0, "modelId": 0}
            )
            return model_details_cursor
        except Exception as e:
            print(f"Error Fetching 'ModeDetails' : {e}")

    def getPromptDetails(self, clientApiKey, promptId):
        try:
            db = self.client["aiAccelerator"]
            LLMPrompts = db["LLMPrompts"]
            promptDetails = LLMPrompts.find_one(
                {"clientApiKey": clientApiKey, "promptId": promptId}, 
                {"clientApiKey": 0, "_id": 0, "promptId": 0}
            )
            return promptDetails
        except Exception as e:
            print(f"Error Fetching 'PromptDetails' : {e}")

