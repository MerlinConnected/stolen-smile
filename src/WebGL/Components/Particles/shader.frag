uniform vec3 uColor;

void main() {

	float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
	float strength = 0.05 / distanceToCenter - 0.1;

	vec4 color = vec4(uColor, strength);
	gl_FragColor = color;
}
