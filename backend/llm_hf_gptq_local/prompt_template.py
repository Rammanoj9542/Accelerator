from langchain.prompts.chat import ChatPromptTemplate

class PromptInitializer:
    def __init__(self, prompt):
        """
        Initialize the PromptInitializer object.

        Args:
            prompt (str): The template string used for initializing the ChatPromptTemplate object.
        
        Returns:
            None
        """
        try:
            # Attempt to initialize the ChatPromptTemplate object from the provided template string
            self.prompt_template = ChatPromptTemplate.from_template(prompt)
            # Extract input variables from the initialized template
            self.input_variables = self.prompt_template.messages[0].prompt.input_variables
        except Exception as e:
            # Handle template initialization error and store the error message
            self.input_variables = {}
            self.error = f"Error initializing template: {e}"

    def initialize_prompt(self, json_data):
        """
        Initialize the prompt by replacing input variables in the template with corresponding values from the JSON data.

        Args:
            json_data (dict): A dictionary containing input variables and their corresponding values.

        Returns:
            tuple: A tuple containing the initialized prompt (str) and an error message (str) if any error occurs.
                   If successful, the error message will be None.
        """
        try:
            # Iterate through input variables in the template
            for key in self.input_variables:
                # Check if the input variable is present in the provided JSON data
                if key in json_data:
                    # Set the input variable as a global variable with the corresponding value
                    globals()[key] = json_data[key]
                else:
                    # Handle missing input variable error and store the error message
                    self.error = f"Error: Missing input variable '{key}' in JSON data."
                    return None, self.error
            # Format the template with the provided JSON data to create the initialized prompt
            prompt = self.prompt_template.format_messages(**json_data)
            # Return the initialized prompt and None as there are no errors
            return prompt, None
        except Exception as e:
            # Handle any exceptions that might occur during prompt initialization and store the error message
            self.error = f"An error occurred: {e}"
            # Return None as the initialized prompt and the error message
            return None, self.error