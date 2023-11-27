uniform float uTime;
attribute float aScale;

float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(float x) {
	float i = floor(x);
	float f = fract(x);
	float u = f * f * (3.0 - 2.0 * f);
	return mix(hash(i), hash(i + 1.0), u);
}

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	modelPosition.y += sin(uTime / 10000. * aScale) * aScale;
	modelPosition.x += noise(uTime / 10000. * aScale) * aScale;

	vec4 viewPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * viewPosition;

	gl_PointSize = 20. * aScale;
}
