import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WithdrawNew() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/wallet?action=withdraw", { replace: true });
  }, [navigate]);

  return null;
}
