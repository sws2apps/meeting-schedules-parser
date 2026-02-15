import JSZip from 'jszip';
import { HTMLElement, parse } from 'node-html-parser';

export const isValidHTML = (name: string): boolean => {
	let valid = false;

	if (name.startsWith('OEBPS') && name.endsWith('.xhtml') && name.indexOf('-extracted') === -1) {
		const fileName = name.split('/')[1].split('.')[0];
		if (!isNaN(parseFloat(fileName))) {
			valid = true;
		}
	}

	return valid;
};

export const getHTMLString = async (zip: JSZip, filename: string): Promise<string> => {
	const content = await zip.file(filename)!.async('string');
	return content;
};

export const isValidMWBSchedule = (htmlDoc: HTMLElement): boolean => {
	const isValidTGW = htmlDoc.querySelector('.du-color--teal-700') ? true : false;
	const isValidAYF = htmlDoc.querySelector('.du-color--gold-700') ? true : false;
	const isValidLC = htmlDoc.querySelector('.du-color--maroon-600') ? true : false;

	return isValidTGW && isValidAYF && isValidLC;
};

export const HTMLParse = (htmlString: string): HTMLElement => {
	const htmlDoc = parse(htmlString);

	return htmlDoc;
};

export const isValidWSchedule = (htmlDoc: HTMLElement): boolean => {
	const valid = htmlDoc.querySelector('.groupTOC') ? true : false;
	return valid;
};
