import os
import time
from datetime import datetime
from langchain.prompts import PromptTemplate
from langchain_community.agent_toolkits.load_tools import load_tools
from langchain.agents import initialize_agent, AgentType
from langchain_community.utilities import SerpAPIWrapper
from groq import Groq  # ✅ replaced
# ❌ removed: from langchain_groq import ChatGroq


class CareerGuidanceSystem:
    def __init__(self, groq_api_key=None, serpapi_key=None):
        """Initialize the career guidance system."""
        self.groq_api_key = groq_api_key
        self.serpapi_key = serpapi_key
        self.llm = None
        self.client = None  # ✅ added
        self.search_agent = None
        self.career_data_cache = {}
        self.search_cache = {}

        if groq_api_key:
            os.environ["GROQ_API_KEY"] = groq_api_key
            self.client = Groq(api_key=groq_api_key)  # ✅ new
            self.llm = True  # just a flag

        if serpapi_key and self.llm:
            os.environ["SERPER_API_KEY"] = serpapi_key
            tools = load_tools(["serpapi"])
            self.search_agent = initialize_agent(
                tools,
                None,  # no LLM required here
                agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
                verbose=False,
                handle_parsing_errors=True,
                max_iterations=5
            )

    def _search_with_cache(self, query, cache_key, ttl_hours=24):
        """Perform a search with caching."""
        if cache_key in self.search_cache:
            entry = self.search_cache[cache_key]
            age_hours = (datetime.now() - entry['timestamp']).total_seconds() / 3600
            if age_hours < ttl_hours:
                return entry['data']

        if not self.search_agent:
            return "Search is not available. Please provide a SerpAPI key for web search capabilities."

        try:
            result = self.search_agent.invoke({"input": query})['output']
            self.search_cache[cache_key] = {'data': result, 'timestamp': datetime.now()}
            return result
        except Exception as e:
            return f"An error occurred during search: {str(e)}"

    def _generate_content(self, prompt_template, career_name):
        """Generate content using Groq SDK."""
        if not self.client:
            return f"Content generation for {career_name} is unavailable. Please provide a Groq API key."

        prompt = prompt_template.format(career=career_name)

        response = self.client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a helpful career guidance assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )

        return response.choices[0].message.content

    def comprehensive_career_analysis(self, career_name):
        """
        Run a comprehensive analysis of a career using just the profession name.
        """
        cache_key = f"{career_name}_full_analysis"
        if cache_key in self.career_data_cache:
            return self.career_data_cache[cache_key]

        analysis_results = {}

        sections = {
            "research": {
                "title": "Career Analysis",
                "query": (
                    f"Create a detailed overview of the {career_name} career with the following structure:\n"
                    f"1. Role Overview\n2. Key Responsibilities\n3. Skills\n4. Education"
                ),
                "prompt": "Provide a comprehensive analysis of the {career} career path."
            },
            "market_analysis": {
                "title": "Market Analysis",
                "query": f"Analyze job market for {career_name}",
                "prompt": "Analyze job market for {career}."
            },
            "learning_roadmap": {
                "title": "Learning Roadmap",
                "query": f"Learning roadmap for {career_name}",
                "prompt": "Create roadmap for {career}."
            },
            "industry_insights": {
                "title": "Industry Insights",
                "query": f"Insights for {career_name}",
                "prompt": "Provide insights for {career}."
            }
        }

        for key, details in sections.items():
            if self.search_agent:
                search_result = self._search_with_cache(details["query"], f"{career_name}_{key}")
                analysis_results[key] = f"# {details['title']}\n\n{search_result}"
            else:
                analysis_results[key] = self._generate_content(details["prompt"], career_name)

        analysis_results["career_name"] = career_name
        analysis_results["timestamp"] = datetime.now().isoformat()

        self.career_data_cache[cache_key] = analysis_results
        return analysis_results

    def chat_with_assistant(self, question, career_data=None):
        """Engage in conversation with a user about career questions."""
        if not self.client:
            return "Career assistant is not available. Please provide a Groq API key."

        context = ""
        if career_data and isinstance(career_data, dict):
            career_name = career_data.get("career_name", "the selected career")
            context = f"Context about {career_name}:\n"
            context += f"{career_data.get('research', '')}\n"
            context += f"{career_data.get('market_analysis', '')}\n"
            context += f"{career_data.get('learning_roadmap', '')}\n"
            context += f"{career_data.get('industry_insights', '')}\n"

        prompt_template = """
You are a helpful and concise career guidance assistant.

Context:
{context}

User Question: {question}
"""
        prompt = prompt_template.format(context=context, question=question)

        response = self.client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a career assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )

        return response.choices[0].message.content