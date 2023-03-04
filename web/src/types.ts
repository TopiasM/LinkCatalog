export type Link = {
	url: string,
	filename: string,
	title: string,
	description: string,
}
export interface Page {
	title: string,
	links: Link[],
	mainDescription: string,
	editConfirmationKey?: string,
	editKey?: string,
}