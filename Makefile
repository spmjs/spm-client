SRC=$(wildcard lib/*.js)
BUILD = $(subst lib/,build/,$(SRC))

build/%.js: lib/%.js
	node_modules/.bin/regenerator --include-runtime $< > $@

build: clean
	@mkdir -p build
	@$(MAKE) $(BUILD)

publish: build
	@npm publish

clean:
	@rm -rf build

test:
	@node --harmony \
		node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha \
		-- \
		--reporter spec \
		--timeout 20000 \
		--require co-mocha

coveralls: test
	cat ./coverage/lcov.info | ./node_modules/.bin/coveralls

debug:
	@node  --harmony $(NODE_DEBUG) ./node_modules/.bin/_mocha \
		--reporter spec \
		--timeout 20000 \
		--require co-mocha

.PHONY: test
