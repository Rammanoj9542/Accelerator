from langchain.text_splitter import CharacterTextSplitter, RecursiveCharacterTextSplitter, TokenTextSplitter, MarkdownHeaderTextSplitter

class DocumentSplitter:
    def __init__(self, ingest_config):
        self.splitter_type = ingest_config.get('splitter_type')
        self.chunk_size = ingest_config.get('chunk_size')
        self.chunk_overlap = ingest_config.get('chunk_overlap')
        self.headers_to_split = ingest_config.get("headers")

    def split_documents(self, text_documents):
        if self.splitter_type in {'CharacterTextSplitter', 'RecursiveCharacterTextSplitter', 'TokenTextSplitter'}:
            splitter_class = {
                'CharacterTextSplitter': CharacterTextSplitter,
                'RecursiveCharacterTextSplitter': RecursiveCharacterTextSplitter,
                'TokenTextSplitter': TokenTextSplitter,
            }.get(self.splitter_type)

            splitter = splitter_class(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
            )

            splitted_text = splitter.split_documents(text_documents)
        else:
            try:
                headers_dict = self.headers_to_split
                headers_list = [(key, value) for key, value in headers_dict.items()]
                splitter = MarkdownHeaderTextSplitter(
                    headers_to_split_on = headers_list
                )
                data = text_documents[0].page_content
                splitted_text = splitter.split_text(data)
                print(splitted_text)
            except Exception as e:
                print(f"Error Fetching 'IngestData' : {e}")


        return splitted_text