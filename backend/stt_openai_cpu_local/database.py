from pymongo.mongo_client import MongoClient
import yaml
import os


class MongoDBHandler:
    def __init__(self, config_path):
        self.config_path = config_path
        self._load_config()
        self._connect_to_mongodb()

    def _load_config(self):
        with open(self.config_path, "r") as config_file:
            config_data = yaml.safe_load(config_file)
            self.db_uri = config_data.get("db_url")

    def _connect_to_mongodb(self):
        self.client = MongoClient(self.db_uri)

        # Send a ping to confirm a successful connection
        try:
            self.client.admin.command("ping")
            print("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            print(e)

    def get_org_id(self, client_api_key):
        try:
            db = self.client["aiAccelerator"]
            clientAPIKeys = db["clientApiKeys"]
            user_id_cursor = clientAPIKeys.find_one(
                {"clientApiKey": client_api_key},
                {"clientApiKey": 0, "_id": 0, "timestamp": 0},
            )
            user_id = user_id_cursor.get("userid")
            userDetails = db["userDetails"]
            organisation_cursor = userDetails.find_one(
                {"userid": user_id},
                {
                    "_id": 0,
                    "userid": 0,
                    "firstname": 0,
                    "lastname": 0,
                    "username": 0,
                    "password": 0,
                    "email": 0,
                    "number": 0,
                    "role": 0,
                    "tempOTP": 0,
                    "tempOTPtimestamp": 0,
                    "OTPattempts": 0,
                    "OTPlocked": 0,
                    "OTPlockedtill": 0,
                },
            )
            organisation = organisation_cursor.get("organisation")
            return organisation
        except Exception as e:
            print(f"Error fetching organisation: {e}")
            return None  # Return None in case of error

    def get_stt_mode_details(self, client_api_key, stt_id):
        try:
            org = self.get_org_id(client_api_key)
            if org:
                db = self.client[org]  # Use get() to handle missing org
                if db is not None:
                    stt_configs = db["STTConfigs"]
                    mode_details_cursor = stt_configs.find_one(
                        {"clientApiKey": client_api_key, "sttId": stt_id},
                        {"clientApiKey": 0, "_id": 0, "sttId": 0},
                    )
                    if mode_details_cursor:
                        return mode_details_cursor.get(
                            "mode"
                        )  # Use get() to handle missing key
            # Handle potential issues or return a default value
            print("Error fetching STT mode details or missing data")
            return None
        except Exception as e:
            print(f"Error fetching STT mode details: {e}")
            return None

    def get_stt_model_details(self, client_api_key, model_id):
        try:
            org = self.get_org_id(client_api_key)
            if org:
                db = self.client[org]  # Use get() to handle missing org
                if db is not None:
                    STTModels = db["STTModels"]
                    model_details_cursor = STTModels.find_one(
                        {"clientApiKey": client_api_key, "modelId": model_id},
                        {"clientApiKey": 0, "_id": 0, "modelId": 0, "modelName": 0},
                    )
                    if model_details_cursor:
                        return model_details_cursor.get(
                            "engine"
                        )  # Use get() to handle missing key
            # Handle potential issues or return a default value
            print("Error fetching model details or missing data")
            return None
        except Exception as e:
            print(f"Error fetching model details: {e}")
            return None
