function main() {
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
  }

	var ctx = canvas.getContext('2d');

// Set canvas background to black
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

// Default test vector
	var v1 = new Vector3([2.25, 2.25, 0]);
	drawVector(v1, 'red', ctx);
}

function drawVector(v, color, ctx) {
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(200, 200); // center of canvas

	let scale = 20;
	let x = 200 + v.elements[0] * scale;
	let y = 200 - v.elements[1] * scale;

	ctx.lineTo(x, y);
	ctx.stroke();
}

function handleDrawEvent() {
	var canvas = document.getElementById('example');
	var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	let v1x = parseFloat(document.getElementById("v1x").value);
	let v1y = parseFloat(document.getElementById("v1y").value);
	let v2x = parseFloat(document.getElementById("v2x").value);
	let v2y = parseFloat(document.getElementById("v2y").value);

	if ([v1x, v1y, v2x, v2y].some(isNaN)) {
		console.log("Please enter valid numbers.");
	return;
  }

	let v1 = new Vector3([v1x, v1y, 0]);
	let v2 = new Vector3([v2x, v2y, 0]);

	drawVector(v1, "red", ctx);
	drawVector(v2, "blue", ctx);
}

function angleBetween(v1, v2) {
	const dot = Vector3.dot(v1, v2);
	const mag1 = v1.magnitude();
	const mag2 = v2.magnitude();

	if (mag1 === 0 || mag2 === 0) {
		console.log("Cannot compute angle with zero-length vector.");
	return null;
  }

	const cosTheta = dot / (mag1 * mag2);
	const angleRadians = Math.acos(Math.min(Math.max(cosTheta, -1), 1));
	const angleDegrees = angleRadians * 180 / Math.PI;
	return angleDegrees;
}

function areaTriangle(v1, v2) {
	const cross = Vector3.cross(v1, v2);
	const areaParallelogram = cross.magnitude();
	return areaParallelogram / 2;
}

function handleDrawOperationEvent() {
	var canvas = document.getElementById('example');
	var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	let v1x = parseFloat(document.getElementById("v1x").value);
	let v1y = parseFloat(document.getElementById("v1y").value);
	let v2x = parseFloat(document.getElementById("v2x").value);
	let v2y = parseFloat(document.getElementById("v2y").value);
	let op = document.getElementById("operation").value;
	let scalar = parseFloat(document.getElementById("scalar").value);

	if ([v1x, v1y, v2x, v2y].some(isNaN)) {
		console.log("Please enter valid numbers for vectors.");
	return;
  }

	let v1 = new Vector3([v1x, v1y, 0]);
	let v2 = new Vector3([v2x, v2y, 0]);

	drawVector(v1, "red", ctx);
	drawVector(v2, "blue", ctx);

	if ((op === "mul" || op === "div") && isNaN(scalar)) {
		console.log("Please enter a valid scalar.");
	return;
  }

	if (op === "add") {
		let v3 = new Vector3([
			v1.elements[0] + v2.elements[0],
			v1.elements[1] + v2.elements[1],
			0,
    ]);
		drawVector(v3, "green", ctx);
  } else if (op === "sub") {
		let v3 = new Vector3([
			v1.elements[0] - v2.elements[0],
			v1.elements[1] - v2.elements[1],
			0,
    ]);
		drawVector(v3, "green", ctx);
  } else if (op === "mul") {
		let v3 = new Vector3([
			v1.elements[0] * scalar,
			v1.elements[1] * scalar,
			0,
    ]);
		let v4 = new Vector3([
			v2.elements[0] * scalar,
			v2.elements[1] * scalar,
			0,
    ]);
		drawVector(v3, "green", ctx);
		drawVector(v4, "green", ctx);
  } else if (op === "div") {
		if (scalar === 0) {
			console.log("Cannot divide by zero.");
		return;
    }
		let v3 = new Vector3([
			v1.elements[0] / scalar,
			v1.elements[1] / scalar,
			0,
    ]);
		let v4 = new Vector3([
			v2.elements[0] / scalar,
			v2.elements[1] / scalar,
			0,
    ]);
		drawVector(v3, "green", ctx);
		drawVector(v4, "green", ctx);
  } else if (op === "angle") {
		let angle = angleBetween(v1, v2);
		if (angle !== null) {
			console.log("Angle: " + angle.toFixed(0));
    }
  } else if (op === "area") {
		let area = areaTriangle(v1, v2);
		console.log("Area of the triangle: " + area.toFixed(2));
  } else if (op === "magnitude") {
 		let mag1 = v1.magnitude();
		let mag2 = v2.magnitude();
		console.log("Magnitude of v1: " + mag1.toFixed(2));
		console.log("Magnitude of v2: " + mag2.toFixed(2));
  } else if (op === "normalize") {
		let v3 = new Vector3(v1.elements);
		let v4 = new Vector3(v2.elements);
		v3.normalize();
		v4.normalize();
		drawVector(v3, "purple", ctx);
		drawVector(v4, "purple", ctx);
  }
}
