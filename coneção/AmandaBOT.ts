import { WASocket, WAMessage } from "@whiskeysockets/baileys";
import fs from 'fs';
import request from 'request';

const API_KEY = '';
let this_sock: WASocket;

function init(sock: WASocket) {
	this_sock = sock;
}

const sendMessage = (jid: string, text: string) => {
	this_sock.sendMessage(jid, { text: text });
}

const sendToGeminiAPI = async (sysInstructions: string, message: string, history: { role: string, text: string }[]): Promise<string> => {
	const messages = [];
	if(history)
		for(const h of history)
			messages.push({ role: h.role, parts: { text: h.text } });
	messages.push({ role: 'user', parts: { text: message } });
	
	const contents = {
		system_instruction: {
			parts: { 
				text: sysInstructions
			}
		},
		safetySettings: [
			{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
			{ category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
			{ category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
			{ category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
			{ category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
		],
		generationConfig: {
			temperature: 2.0
		},
		contents: messages
	};
	
	var result = '';
	await (new Promise((rs, rj) => {
		request.post(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
			{ 
				json: true, 
				body: contents 
			},
			(err, resp, body) => {
				try {
					if (!err && resp.statusCode == 200) {
						result = `${body.candidates[0].content.parts[0].text}`;
						rs(body);
					} else
						rj(err);
				} catch(ex) {
					rj(ex);
				}
			}
		);
	}));
	
	return result;
}

const handleGemini = async (sysInstructions: string, text: string, jid: string) => {
	const histFilename = `./historical/hist.${jid}.json`;
	let history = [];
	try {
		history = JSON.parse(fs.readFileSync(histFilename, 'utf8'));
	} catch {
	}
	
	const gResponse = await sendToGeminiAPI(sysInstructions, text, history);
	
	if(gResponse) {
		try {
			history.push({role: 'user', text: text });
			history.push({role: 'model', text: gResponse });
			
			fs.writeFileSync(histFilename, JSON.stringify(history, undefined, 2), 'utf8')
		} catch {
		}
		sendMessage(jid, gResponse); 
	} else
		sendMessage(jid, 'ERROR - GEMINI NOT ANSWER');	
}

const handleFromGroup = (text: string, jid: string) => {
	if(text.toLowerCase().includes("amanda")) {
		let sysInstructions = null;
		try {
			fs.readFileSync(`sys_inst.${jid}.config`, 'utf8');
		} catch {
			console.log(`sys_inst.${jid}.config NOT FOUND...`);
		}
		if(!sysInstructions)
			sysInstructions = fs.readFileSync(`sys_inst.default.config`, 'utf8');
		
		handleGemini(sysInstructions, text, jid);
	}
}

const handleFromPm = (text: string, jid: string) => {
	const sysInstructions = fs.readFileSync('sys_inst.light.config', 'utf8');

	handleGemini(sysInstructions, text, jid);
}

const fromGroup = (msg: WAMessage): boolean => {
	return msg?.key?.remoteJid?.endsWith('@g.us');
}

const extractText = (msg: WAMessage): string => {
	const firstNNOE = (...params: string[]) => {
		for(let p of params)
			if(p)
				return p;
		return null;
	};

	return firstNNOE(
		msg.message?.conversation,
		msg.message?.imageMessage?.caption,
		msg.message?.videoMessage?.caption,
		msg.message?.extendedTextMessage?.text,
		msg.message?.buttonsResponseMessage?.selectedDisplayText,
		msg.message?.listResponseMessage?.title,
		msg.message?.eventMessage?.name
	);;
}

async function handle(msg: WAMessage): Promise<void> {
	const text = extractText(msg);
	if(text) {
		if(fromGroup(msg))
			handleFromGroup(text, msg.key.remoteJid); else
			handleFromPm(text, msg.key.remoteJid);
	}
}

export = {
	init,
    handle
};