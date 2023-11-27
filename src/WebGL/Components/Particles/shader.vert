uniform float uTime;
attribute float aScale;


void main() {
//	float boxSize = uHalfBoxSize * 2.;
//
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	modelPosition.y += sin(uTime  / (10000. * aScale)) *aScale;
//	modelPosition.x += noise(uTime + modelPosition.x) * aScale * 0.1;

	vec4 viewPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * viewPosition;

	gl_PointSize = 20. * aScale;
}
