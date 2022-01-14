
const canvas = document.querySelector('#test');
const ns = 'http://www.w3.org/2000/svg'; // namespace

const canvasHeight = canvas.getBoundingClientRect().height;

const groupNodes = canvas.querySelector('#nodes');
const groupLines = canvas.querySelector('#lines');

// some config variables
const levels = 12;
const abstand = Math.floor(canvasHeight/(levels-2+1));
const varianz = 50;
// end config

const randomString = function () {
	return Math.random().toString(36).substr(2, 5);
}

const randomInt = function (min, max) { // min and max included 
	return Math.floor(Math.random() * (max - min + 1) + min);
}

const highlightConnections = function (ele) {
	const connections = ele.target.getAttributeNS(null, 'data-connections').split(',');
	const targetLevel = ele.target.getAttributeNS(null, 'data-level');

	for (const conn of connections) {
		const connEle = groupNodes.querySelector('#'+conn);
		const connLevel = connEle.getAttributeNS(null, 'data-level');
		if (targetLevel < connLevel) {
			connEle.classList.add('active');
		}
	}
}

const clearConnections = function (ele) {
	groupNodes.querySelectorAll('rect').forEach(function (ele, i) {
		ele.classList.remove('active');
	});
}

const makeNode = function (params) {
	const rect = document.createElementNS(ns, 'rect');
	rect.setAttributeNS(null, 'id', 'node-'+randomString());
	rect.setAttributeNS(null, 'x', params.x);
	rect.setAttributeNS(null, 'y', params.y);
	rect.setAttributeNS(null, 'width', params.w);
	rect.setAttributeNS(null, 'height', params.h);

	return rect;
}

const makeConnection = function (ele1, ele2) {
	const line = document.createElementNS(ns, 'line');
	line.setAttributeNS(null, 'id', 'node-'+randomString());

	const ele1X = ele1.getBBox().x + ele1.getBBox().width / 2;
	const ele1Y = ele1.getBBox().y + ele1.getBBox().height / 2;
	
	const ele2X = ele2.getBBox().x + ele2.getBBox().width / 2;
	const ele2Y = ele2.getBBox().y + ele2.getBBox().height / 2;

	line.setAttributeNS(null, 'x1', ele1X);
	line.setAttributeNS(null, 'y1', ele1Y);
	line.setAttributeNS(null, 'x2', ele2X);
	line.setAttributeNS(null, 'y2', ele2Y);
	line.classList.add('connection');

	// preserve connection info
	const ele1ID = ele1.getAttributeNS(null, 'id');
	const ele1conn = ele1.getAttributeNS(null, 'data-connections') || '';
	
	const ele2ID = ele2.getAttributeNS(null, 'id');
	const ele2conn = ele2.getAttributeNS(null, 'data-connections') || '';

	if (!ele2conn.includes(ele1ID)) {
		if (ele2conn.length > 0) {
			ele2.setAttributeNS(null, 'data-connections', ele2conn+','+ele1ID);
		} else {
			ele2.setAttributeNS(null, 'data-connections', ele1ID);
		}
	}

	if (!ele1conn.includes(ele2ID)) {
		if (ele1conn.length > 0) {
			ele1.setAttributeNS(null, 'data-connections', ele1conn+','+ele2ID);
		} else {
			ele1.setAttributeNS(null, 'data-connections', ele2ID);
		}
	}

	return line;
}

// add the initial node, aka. start point
const ele = makeNode({
	'x': canvas.getBoundingClientRect().width/2,
	'y': canvasHeight-12,
	'w': 10,
	'h': 10
});

ele.classList.add('normal');
ele.setAttributeNS(null, 'data-level', 0);
ele.addEventListener('mouseover', highlightConnections);
ele.addEventListener('mouseout', clearConnections);

groupNodes.appendChild(ele);

// make an object to contain references to all nodes, group by level
const tree = [
	[ele.getAttributeNS(null, 'id')]
];

for (let i=0; i<(levels-2); i++) {
	tree.push([]);

	for (const nodeID of tree[i]) {
		const node = groupNodes.querySelector('#'+nodeID);

		// weighted random int
		const items = [1,1,1,1,2];
		const split = items[Math.floor(Math.random()*items.length)];
		
		for (let j = 0; j < split; j++) {
			const eleNew = makeNode({
				'x': randomInt(node.getBBox().x-varianz, node.getBBox().x+varianz),
				'y': canvasHeight - ((i+1)*abstand),
				'w': 10,
				'h': 10
			});
			eleNew.classList.add('normal');
			eleNew.addEventListener('mouseover', highlightConnections);
			eleNew.addEventListener('mouseout', clearConnections);
			eleNew.setAttributeNS(null, 'data-level', i+1);
			groupNodes.appendChild(eleNew);

			tree[i+1].push(eleNew.getAttributeNS(null, 'id'));

			const line = makeConnection(node, eleNew);
			groupLines.appendChild(line);
		}
	}
}

// add the final node, aka. boss
const lastLevel = tree.length-1;
tree.push([]);

const eleNew = makeNode({
	'x': canvas.getBoundingClientRect().width/2,
	'y': 2,
	'w': 10,
	'h': 10
});
eleNew.classList.add('normal');
eleNew.setAttributeNS(null, 'data-level', lastLevel+1);
groupNodes.appendChild(eleNew);

tree[lastLevel+1].push(eleNew.getAttributeNS(null, 'id'));

for (const nodeID of tree[lastLevel]) {
	const node = groupNodes.querySelector('#'+nodeID);

	const line = makeConnection(node, eleNew);
	groupLines.appendChild(line);
}
