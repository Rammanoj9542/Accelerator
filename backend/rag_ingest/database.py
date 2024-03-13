from pymongo.mongo_client import MongoClient
import yaml

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
            print(user_id)
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

    def getEmbeddingModelDetails(self, clientApiKey, modelId):
        try:
            print(clientApiKey)
            org = self.get_org_id(clientApiKey)
            print("org")
            print(org)
            if org:
                db = self.client[org]
            if db is not None:
                EmbeddingModels = db["EmbeddingModels"]
                model_details_cursor = EmbeddingModels.find_one(
                    {"clientApiKey": clientApiKey, "modelId": modelId},
                    {"clientApiKey": 0, "_id": 0, "modelId": 0}
                )
                return model_details_cursor
            print("Error fetching Embedding Model details or missing data")
            return None
        except Exception as e:
            print(f"Error Fetching 'ModeDetails' : {e}")

    def getIngestConfig(self, clientApiKey, ingestId):
        try:
            org = self.get_org_id(clientApiKey)
            if org:
                db = self.client[org]
            if db is not None:
                IngestConfig = db["IngestConfig"]
                IngestData = IngestConfig.find_one(
                    {"clientApiKey": clientApiKey, "ingestId": ingestId}, 
                    {"clientApiKey": 0, "_id": 0, "ingestId": 0}
                )
                print(IngestData)
                return IngestData
            print("Error fetching Ingest Config details or missing data")
            return None
        except Exception as e:
            print(f"Error Fetching 'IngestData' : {e}")

