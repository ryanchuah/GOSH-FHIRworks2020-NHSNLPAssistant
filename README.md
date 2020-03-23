# NHS NLP Assistant
This project aims to allow users to search for patient data stored in the FHIR format through speech-to-text and Natural Language Processing

## How to run server
First, install dependencies by running `npm install`. Then, run `npm run server`

## How to run chatbot
1. Deploy the server online. There are many ways to do this, the easiest using *ngrok* to expose your local server online. In this case, the default port is 8080, so the ngrok command is `ngrok http 8080` (note that your server must already be running before you run this command).
2. Visit your DialogFlow console. There are two ways to do this.  
Firstly, you can log in to Dialogflow using the credentials provided [below](#Dialogflow).  
Alternatively, you can create your own Dialogflow agent using any Google account then restore the agent zip file included in this repository into your newly created agent.
3. Once in your Dialogflow console, navigate to fulfillment (in the side menu, click Fulfillment). There, change the URL to your "*your_url*/api/agent". Note that the URL must use the HTTPS protocol.
4. Then, you can start chatting with the bot from the panel on the right side of your Dialogflow console to search for patients. Alternatively, you can navigate to Integrations to integrate your chatbot with various platforms.

## Credentials
### Dialogflow
Redacted

## Notes 
1. I am using my own Node.js API to serve patient data. This patient data is taken directly from fetching patient data through the .NET API provided.
2. Currently, you can search by using a patient's name, gender, date of birth, country, state, and city only. The code is structured to easily add filters to extend the code.
3. The more filters you use, the more accurate the result will be. Eg. _"Look for Mr Abram Weimann born on July 12th 1965 who lives in Hanson, Massachusetts in the US and speaks English"_ will be much more likely to return the result you want when compared to _"Look for Abram Weimann who lives in the United States"_
4. Since names are a pain point when it comes to speech to text, a fuzzy search is used on patient names once all other filters are applied.
5. My video submission utilizes Dialogflow's "Web Demo" Integration.
