from pymongo.mongo_client import MongoClient
import yaml
import os

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

    def get_stt_mode_details(self, client_api_key, stt_id):
        try:
            db = self.client["aiAccelerator"]
            stt_configs = db["STTConfigs"]
            mode_details_cursor = stt_configs.find_one(
                {"clientApiKey": client_api_key, "sttId": stt_id},
                {"clientApiKey": 0, "_id": 0, "sttId": 0}
            )
            return mode_details_cursor['mode']
        except Exception as e:
            print(f"Error Fetching 'ModeDetails' : {e}")

    def get_stt_model_details(self, client_api_key, model_id):
        try:
            db = self.client["aiAccelerator"]
            STTModels = db["STTModels"]
            model_details_cursor = STTModels.find_one(
                {"clientApiKey": client_api_key, "modelId": model_id},
                {"clientApiKey": 0, "_id": 0, "modelId": 0}
            )
            return model_details_cursor['modelName']
        except Exception as e:
            print(f"Error Fetching 'ModelDetails' : {e}")

