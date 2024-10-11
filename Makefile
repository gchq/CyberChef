# Variables
UPSTREAM_REPO := upstream
UPSTREAM_URL := https://github.com/gchq/CyberChef.git
FORK_REPO := origin
DEFAULT_BRANCH := main

# Default target if no target is specified
.DEFAULT_GOAL := help

# Help command
help:
	@echo "Usage:"
	@echo "  make pr PR_ID=<PR_ID>           - Fetch and push a PR from the upstream repo"
	@echo "  make setup-upstream             - Set up upstream repo (idempotent)"
	@echo "  make clean PR_ID=<PR_ID>        - Clean up the local PR branch"

# Setup upstream repo (idempotent)
setup-upstream:
	@echo "Checking if upstream repo exists..."
	@if ! git remote get-url $(UPSTREAM_REPO) >/dev/null 2>&1; then \
		echo "Upstream repo not found. Adding upstream..."; \
		git remote add $(UPSTREAM_REPO) $(UPSTREAM_URL); \
	else \
		echo "Upstream repo already exists."; \
	fi

# Fetch the PR from upstream, create a branch, and push it to your fork
pr: setup-upstream
	@if [ -z "$(PR_ID)" ]; then \
		echo "Error: PR_ID is not set. Usage: make pr PR_ID=<PR_ID>"; \
		exit 1; \
	fi
	git fetch $(UPSTREAM_REPO) pull/$(PR_ID)/head:pr-$(PR_ID)
	git checkout pr-$(PR_ID)
	git push $(FORK_REPO) pr-$(PR_ID)

# Clean up the local PR branch
clean:
	@if [ -z "$(PR_ID)" ]; then \
		echo "Error: PR_ID is not set. Usage: make clean PR_ID=<PR_ID>"; \
		exit 1; \
	fi
	git branch -d pr-$(PR_ID)
