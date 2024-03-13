import os
from langchain.chains import ConversationChain
from langchain.prompts.prompt import PromptTemplate
from langchain.llms import HuggingFacePipeline
from transformers import (
    AutoTokenizer,
    GenerationConfig,
    pipeline,
)
from auto_gptq import AutoGPTQForCausalLM
import logging

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "local_gptq")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


class Model:
    def __init__(self, modeltype, model_id = None, model_basename = None):
        """
        Initializes the Model object.

        Args:
            modeltype (str): Type of the model, either 'OpenAI' or other model types.
            model_id (str, optional): Environment variable name for OpenAI API key. Defaults to None.
            model_basename (str, optional): Model file name. Defaults to None.
        """
        self.model_id = model_id
        self.model_basename = model_basename
        # Set the path to the models directory
        self.modelpath = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))

        # Load quantized gguf models or handle errors if loading fails
        self.model = self._load_quantized_model_qptq()

    def _load_quantized_model_qptq(self):
        """
        Load a GPTQ quantized model using AutoGPTQForCausalLM.

        This function loads a quantized model that ends with GPTQ and may have variations
        of .no-act.order or .safetensors in their HuggingFace repo.

        Parameters:
        - model_id (str): The identifier for the model on HuggingFace Hub.
        - model_basename (str): The base name of the model file.
        - device_type (str): The type of device where the model will run.
        - logging (logging.Logger): Logger instance for logging messages.

        Returns:
        - model (AutoGPTQForCausalLM): The loaded quantized model.
        - tokenizer (AutoTokenizer): The tokenizer associated with the model.

        Notes:
        - The function checks for the ".safetensors" ending in the model_basename and removes it if present.
        """

        # The code supports all huggingface models that ends with GPTQ and have some variation
        # of .no-act.order or .safetensors in their HF repo.
        print("Using AutoGPTQForCausalLM for quantized models")

        if ".safetensors" in self.model_basename:
            # Remove the ".safetensors" ending if present
            model_basename = model_basename.replace(".safetensors", "")

        tokenizer = AutoTokenizer.from_pretrained(self.model_id, use_fast=True)
        print("Tokenizer loaded")

        model = AutoGPTQForCausalLM.from_quantized(
            self.model_id,
            model_basename = model_basename,
            resume_download = True,
            cache_dir = self.modelpath,
            use_safetensors=True,
            trust_remote_code=True,
            device_map="auto",
            use_triton=False,
            quantize_config=None,
        )
        # Load configuration from the model to avoid warnings
        generation_config = GenerationConfig.from_pretrained(self.model_id)
        # see here for details:
        # https://huggingface.co/docs/transformers/
        # main_classes/text_generation#transformers.GenerationConfig.from_pretrained.returns

        # Create a pipeline for text generation
        MAX_NEW_TOKENS = 4096
        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_length=MAX_NEW_TOKENS,
            temperature=0.2,
            # top_p=0.95,
            repetition_penalty=1.15,
            generation_config=generation_config,
        )

        local_llm = HuggingFacePipeline(pipeline=pipe)
        return local_llm


    def generate_response(self, prompt):
        """
        Generates a response based on the given prompt using the loaded model.

        Args:
            prompt (str): Input prompt for generating the response.

        Returns:
            response: Generated response based on the input prompt.
            error_message (str): Error message if response generation fails, None otherwise.
        """
        try:
            # Generate response using the loaded model with the provided prompt
            response = self.model(prompt)
            # Implement any additional processing if needed

            # Return the generated response along with None error message
            return response
        except Exception as e:
            logger.log(f"An error occurred during response generation: {e}")
            raise RuntimeError(f"An error occurred during response generation: {e}")

        
    def generate_conversational_response(self, promptType, memoryhistory, humanMessage, systemTemplate=None):
        """
        Generates a conversational response based on the given input parameters.

        Args:
            promptType (str): Type of prompt, either 'system' or 'simple'.
            memoryhistory (list): List of previous conversation history.
            humanMessage (str): User's input message.
            systemTemplate (str, optional): System-level prompt template. Defaults to None.

        Returns:
            response: Generated conversational response.
            updated_memoryhistory (list): Updated conversation history after processing the input.
            error_message (str): Error message if response generation fails, None otherwise.
        """
        try:
            # Check the type of prompt and create a ConversationChain instance accordingly
            if promptType == 'system':
                # If promptType is 'system', create a ConversationChain with system-level template
                cov = ConversationChain(
                    llm=self.model,
                    memory=memoryhistory,
                    prompt=PromptTemplate(input_variables=["history", "input"], template=systemTemplate),
                    verbose=True
                )
            elif promptType == 'simple':
                # If promptType is 'simple', create a ConversationChain without system-level template
                cov = ConversationChain(
                    llm=self.model,
                    memory=memoryhistory,
                    verbose=True
                )

            # Predict the response based on the input humanMessage using the ConversationChain
            response = cov.predict(input=humanMessage)

            # Return the generated response, updated conversation history, and None error message
            return response, memoryhistory

        except Exception as e:
            # Handle exceptions and provide an error message if response generation fails
            logger.error(f"An error occurred during conversational response generation: {e}")
            raise RuntimeError(f"An error occurred during conversational response generation: {e}")
