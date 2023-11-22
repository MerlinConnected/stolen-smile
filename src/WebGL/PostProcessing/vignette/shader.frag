uniform sampler2D frontTexture;
uniform sampler2D maskTexture;
uniform float opacity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 color = texture(frontTexture, uv);
	vec4 mask = texture(maskTexture, uv);

	color = mix(color, inputColor, mask.r * (1. - opacity));

	outputColor = color;
}
