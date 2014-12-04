
.PHONY: default
default:
	rm -rf build
	node build
	cp -r sounds build/sounds
	cp -r images build/images
