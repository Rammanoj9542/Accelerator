import torch
import os
import logging
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "stt_openai_gpu")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


class STTModel:
    def __init__(self, model_id = None, deviceType = 'gpu'):
        """
        Initializes the Model object.

        Args:
            model_id (str, optional): Model identifier. Defaults to None.
            deviceType (str, optional): Device type for model execution, 'cpu', 'cuda', or 'mps'. Defaults to 'cpu'.
        """
        # Initialize instance variables based on input arguments
        self.model_id = model_id
        self.device_type = deviceType
        self.modelpath = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))

        self.model = self._load_stt_model()

    def _load_stt_model(self):
        """
        Loads the OpenAI STT model for audio to text generation.

        Returns:
            model: Loaded OpenAI STT model for audio to text generation
            error_message (str): Error message if model loading fails, None otherwise.
        """
        try:
            if self.device_type == 'gpu':
                device = "cuda:0" if torch.cuda.is_available() else "cpu"
                torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
            
            model_id = self.model_id
            model = AutoModelForSpeechSeq2Seq.from_pretrained(
                self.model_id,
                torch_dtype=torch_dtype,
                low_cpu_mem_usage=True,
                use_safetensors=True,
                resume_download=True, 
                cache_dir=self.modelpath,
            )
            model.to(device)

            processor = AutoProcessor.from_pretrained(model_id)

            pipe = pipeline(
                "automatic-speech-recognition",
                model=model,
                tokenizer=processor.tokenizer,
                feature_extractor=processor.feature_extractor,
                max_new_tokens=128,
                chunk_length_s=30,
                batch_size=16,
                return_timestamps=True,
                torch_dtype=torch_dtype,
                device=device,
            )

            return pipe
        except Exception as e:
            # Handle exceptions and provide an error message if model loading fails
            logger.error(f"Error loading OpenAI model: {e}")
            # Return None for the model and the error message if loading fails
            raise RuntimeError(f"Error loading OpenAI model: {e}")


    
    def translate(self, input_file):
        """
        Generates a text based on the given input_file using the loaded model.

        Args:
            prompt (str): Input audio/video file for generating the response.

        Returns:
            response: Generated response based on the input file.
            error_message (str): Error message if translate fails, None otherwise.
        """
        try:
            # Generate response using the loaded model with the provided prompt
            transcription_result = self.model(input_file)
            text = transcription_result["text"]
            # Implement any additional processing if needed

            # Return the generated response along with None error message
            return text, None
        except FileNotFoundError as e:
            logger.error(f"An error occurred during transcription file: {e}")
            return "", f"Error: File not found: {str(e)}"
        except Exception as e:
            logger.error(f"An error occurred during transcription file: {e}")
            return "", f"Error during transcription: {str(e)}"
