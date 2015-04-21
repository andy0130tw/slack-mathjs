var Attachment = function(text) {
	//set default values
	this.mrkdwn_in = ['text'];

	//initialize
	if(text) {
		this.text = text;
		//remove any markup... May cause strings in MathJS output break
		this.fallback = text.replace(/[_*]/g, '');
	}
};

Attachment.prototype.setColor = function(o) {
	this.color = o;
}

module.exports = Attachment;
