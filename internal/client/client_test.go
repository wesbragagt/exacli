package client

import (
	"encoding/json"
	"testing"
)

func TestSearchResponseDecodesObjectOutput(t *testing.T) {
	const response = `{
		"requestId": "req-123",
		"output": {
			"content": {
				"answer": "NixOS is declarative."
			}
		}
	}`

	var parsed SearchResponse
	if err := json.Unmarshal([]byte(response), &parsed); err != nil {
		t.Fatalf("decode search response: %v", err)
	}

	content, ok := parsed.Output.Content.(map[string]any)
	if !ok {
		t.Fatalf("output content has type %T, want map[string]any", parsed.Output.Content)
	}
	if got, want := content["answer"], "NixOS is declarative."; got != want {
		t.Errorf("output answer = %q, want %q", got, want)
	}
}
