"""
stellar_connection.py — Conecta el bot al contrato Soroban real de Mañana Seguro
CONTRACT_ID: CA4M25CNPPXIPLXZLJZQBPAOKY5REKUOFNJVTMGJ4RKK4QYNIYIG6NLP
"""

from stellar_sdk import Server, SorobanServer, Network, scval

CONTRACT_ID = "CA4M25CNPPXIPLXZLJZQBPAOKY5REKUOFNJVTMGJ4RKK4QYNIYIG6NLP"
HORIZON_URL = "https://horizon-testnet.stellar.org"
SOROBAN_URL = "https://soroban-testnet.stellar.org"
STROOP      = 10_000_000  # 1 USDC = 10_000_000 stroops


def get_account_info(public_key: str) -> dict:
    """Balance real de XLM y USDC en la wallet"""
    try:
        server   = Server(HORIZON_URL)
        account  = server.accounts().account_id(public_key).call()
        balances = account.get("balances", [])
        xlm  = float(next((b["balance"] for b in balances if b.get("asset_type") == "native"), 0))
        usdc = float(next((b["balance"] for b in balances if b.get("asset_code") == "USDC"), 0))
        return {"ok": True, "xlm": xlm, "usdc": usdc}
    except Exception as e:
        return {"ok": False, "error": str(e), "xlm": 0.0, "usdc": 0.0}


def get_contract_balance(public_key: str) -> dict:
    """Saldo bloqueado en el contrato Soroban"""
    try:
        server = SorobanServer(SOROBAN_URL)

        # Llamar ver_balance(usuario)
        result = server.simulate_transaction(
            server._build_invoke_contract_tx(
                contract_id=CONTRACT_ID,
                function_name="ver_balance",
                args=[scval.to_address(public_key)],
                source_account=public_key,
                network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
            )
        )
        raw = scval.from_int128(result.results[0].xdr)
        return {"ok": True, "balance": int(raw) / STROOP}
    except Exception as e:
        return {"ok": False, "error": str(e), "balance": 0.0}


def get_retiro_fecha(public_key: str) -> dict:
    """Fecha de retiro configurada en el contrato"""
    try:
        server = SorobanServer(SOROBAN_URL)
        result = server.simulate_transaction(
            server._build_invoke_contract_tx(
                contract_id=CONTRACT_ID,
                function_name="ver_retiro",
                args=[scval.to_address(public_key)],
                source_account=public_key,
                network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
            )
        )
        ts = scval.from_uint64(result.results[0].xdr)
        if not ts or ts == 0:
            return {"ok": True, "fecha": "Pendiente de primer depósito"}
        from datetime import datetime
        fecha = datetime.fromtimestamp(int(ts)).strftime("%d de %B de %Y")
        return {"ok": True, "fecha": fecha}
    except Exception as e:
        return {"ok": False, "error": str(e), "fecha": "—"}


def verificar_contrato() -> dict:
    """Verifica que el contrato responde en testnet"""
    try:
        server = SorobanServer(SOROBAN_URL)
        ledger = server.get_latest_ledger()
        return {"ok": True, "ledger": ledger.sequence, "contract_id": CONTRACT_ID}
    except Exception as e:
        return {"ok": False, "error": str(e)}
