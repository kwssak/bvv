package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// PlategaClient реализует взаимодействие с API Platega.io
type PlategaClient struct {
	APIKey string
	BaseURL string
}

type CreatePaymentRequest struct {
	Amount       float64 `json:"amount"`
	Currency     string  `json:"currency"`
	Description  string  `json:"description"`
	OrderID      string  `json:"order_id"`
	CustomerEmail string `json:"customer_email,omitempty"`
}

type CreatePaymentResponse struct {
	Success bool   `json:"success"`
	PaymentURL string `json:"payment_url"`
	TransactionID string `json:"transaction_id"`
}

// NewPlategaClient создает новый экземпляр клиента
func NewPlategaClient(apiKey string) *PlategaClient {
	return &PlategaClient{
		APIKey:  apiKey,
		BaseURL: "https://api.platega.io/v1",
	}
}

// CreatePayment создает ссылку на оплату
func (c *PlategaClient) CreatePayment(req CreatePaymentRequest) (*CreatePaymentResponse, error) {
	payload, _ := json.Marshal(req)
	
	httpReq, err := http.NewRequest("POST", c.BaseURL+"/payments", bytes.NewBuffer(payload))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.APIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result CreatePaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if !result.Success {
		return nil, fmt.Errorf("platega API error")
	}

	return &result, nil
}
