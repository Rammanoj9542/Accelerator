import os
from langchain.document_loaders import CSVLoader, PDFMinerLoader, TextLoader, UnstructuredExcelLoader, Docx2txtLoader, PyPDFLoader
from langchain.document_loaders import UnstructuredMarkdownLoader
from langchain.docstore.document import Document

class DocumentLoader:
    DOCUMENT_MAP = {
        ".txt": TextLoader,
        ".md": UnstructuredMarkdownLoader,
        ".py": TextLoader,
        # ".pdf": PDFMinerLoader,
        ".pdf": PyPDFLoader,
        ".csv": CSVLoader,
        ".xls": UnstructuredExcelLoader,
        ".xlsx": UnstructuredExcelLoader,
        ".docx": Docx2txtLoader,
        ".doc": Docx2txtLoader,
    }

    def __init__(self, source_dir):
        self.source_dir = source_dir
        self.docs = []

    def load_documents(self):
        # Loads all documents from the source documents directory, including nested folders
        for root, _, files in os.walk(self.source_dir):
            for file_name in files:
                print('Importing: ' + file_name)
                file_extension = os.path.splitext(file_name)[1]
                print(file_extension)
                source_file_path = os.path.join(root, file_name)
                if file_extension in self.DOCUMENT_MAP.keys():
                    loader_class = self.DOCUMENT_MAP.get(file_extension)
                    if loader_class:
                        loader = loader_class(source_file_path)
                        print(source_file_path + ' loaded.')
                        self.docs.append(loader.load()[0])
        return self.docs
    
    @staticmethod
    def split_documents(documents):
        # Splits documents for correct Text Splitter
        text_docs, python_docs = [], []
        for doc in documents:
            if doc is not None:
                file_extension = os.path.splitext(doc.metadata["source"])[1]
                if file_extension == ".py":
                    python_docs.append(doc)
                else:
                    text_docs.append(doc)
        return text_docs, python_docs