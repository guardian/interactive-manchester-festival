import mustache from 'mustache'
import mainHTML from '../text/main.html!text'

export class Square {
	constructor(id, height, width, color, el) {
		this.height = height;
		this.width = width;
		this.name = id;
		this.area = this.height * this.width;
		this.parent = el;
		this.color = color; 
	}

	render() {
		console.log("rendering...");
		this.parent.innerHTML = mustache.render(mainHTML, {this:this});
	}

	enlarge(scale) {
		console.log("enlarging...");
		document.getElementById(this.name).style.transform = `scale(${scale})`;
	}
}