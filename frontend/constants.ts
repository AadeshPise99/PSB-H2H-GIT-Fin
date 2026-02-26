export const USER_XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<request>
     <header>
          <source>BoB</source>
          <datetime>20240125T205243</datetime>
          <description>FR update message to sp</description>
     </header>
     <fundingresponses>
          <fundingresponse action="fund" action_date="20251216" amount="2000" comment="Transaction declined Successfully" currency="INR" id="frq#PSB5cb99ea232514f2fb41527253cb3ba3c" due_date="20251220" bank_ref="BARBH24025e900830"/>
     </fundingresponses>
</request>`;

export const GENERATION_PROMPT = `
You are a banking system generator.
Generate a valid XML response based STRICTLY on the following template structure. 
Update the 'datetime', 'action_date', 'due_date' to current dates.
Generate a NEW unique random string for 'id' (starting with frq#PSB) and 'bank_ref' (starting with BARBH).
Keep the structure exactly as shown. Return ONLY the XML string.

Template:
${USER_XML_TEMPLATE}
`;