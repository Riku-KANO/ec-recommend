package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, "Backend mock server is running")
    })
    
    fmt.Println("Backend mock server starting on :8080")
    http.ListenAndServe(":8080", nil)
}