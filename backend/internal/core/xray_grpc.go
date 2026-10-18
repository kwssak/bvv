package core

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	pb "github.com/xtls/xray-core/app/proxyman/command"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// XrayManager отвечает за прямое общение с ядром Xray через gRPC
type XrayManager struct {
	conn   *grpc.ClientConn
	client pb.HandlerServiceClient
}

// NewXrayManager создает подключение к локальному gRPC серверу Xray (порт 10085 по умолчанию)
func NewXrayManager(address string) (*XrayManager, error) {
	conn, err := grpc.Dial(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Xray gRPC: %w", err)
	}
	return &XrayManager{
		conn:   conn,
		client: pb.NewHandlerServiceClient(conn),
	}, nil
}

// AddInbound добавляет новую ноду (inbound) в работающее ядро Xray
func (m *XrayManager) AddInbound(ctx context.Context, inboundConfig map[string]interface{}) error {
	inboundJSON, err := json.Marshal(inboundConfig)
	if err != nil {
		return fmt.Errorf("failed to marshal inbound config: %w", err)
	}

	req := &pb.AddInboundRequest{
		Inbound: inboundJSON,
	}

	_, err = m.client.AddInbound(ctx, req)
	if err != nil {
		return fmt.Errorf("gRPC AddInbound failed: %w", err)
	}
	
	log.Printf("[Xray gRPC] Успешно добавлен inbound на порту %v", inboundConfig["port"])
	return nil
}

// RemoveInbound удаляет ноду по её тегу (обычно это "inbound-порт")
func (m *XrayManager) RemoveInbound(ctx context.Context, tag string) error {
	req := &pb.RemoveInboundRequest{
		Tag: tag,
	}
	_, err := m.client.RemoveInbound(ctx, req)
	if err != nil {
		return fmt.Errorf("gRPC RemoveInbound failed: %w", err)
	}
	log.Printf("[Xray gRPC] Успешно удален inbound с тегом %s", tag)
	return nil
}

// Close закрывает gRPC соединение
func (m *XrayManager) Close() {
	if m.conn != nil {
		m.conn.Close()
	}
}
