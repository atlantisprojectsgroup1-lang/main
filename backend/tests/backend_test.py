"""Backend API tests for ATLANTIS platform."""
import os
import re
import time
import uuid
import json

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://atlantis-preview.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "atlantisprojectsgroup@gmail.com"
ADMIN_PASSWORD = "Atlantis@2026"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["role"] == "super_admin"
    assert "token" in data and data["token"]
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# --- Public endpoints ---
class TestPublic:
    def test_root(self, s):
        r = s.get(f"{API}/", timeout=15)
        assert r.status_code == 200

    def test_company(self, s):
        r = s.get(f"{API}/company", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("brand_name")

    def test_projects_list(self, s):
        r = s.get(f"{API}/projects", timeout=15)
        assert r.status_code == 200
        projects = r.json()
        assert isinstance(projects, list) and len(projects) >= 6, f"expected >=6 projects got {len(projects)}"
        assert all("slug" in p and "_id" not in p for p in projects)

    def test_projects_filters(self, s):
        r = s.get(f"{API}/projects?status=DELIVERED", timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p.get("status") == "DELIVERED"

    def test_project_filters_meta(self, s):
        r = s.get(f"{API}/projects/meta/filters", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "cities" in d and ("configs" in d or "types" in d)

    def test_project_detail(self, s):
        list_r = s.get(f"{API}/projects", timeout=15).json()
        slug = list_r[0]["slug"]
        r = s.get(f"{API}/projects/{slug}", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == slug
        assert "faqs" in d and "similar_projects" in d

    def test_project_detail_404(self, s):
        r = s.get(f"{API}/projects/does-not-exist-xyz", timeout=15)
        assert r.status_code == 404

    def test_stats(self, s):
        r = s.get(f"{API}/stats", timeout=15)
        assert r.status_code == 200
        assert "total_projects" in r.json()

    def test_testimonials(self, s):
        r = s.get(f"{API}/testimonials", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_faqs(self, s):
        r = s.get(f"{API}/faqs", timeout=15)
        assert r.status_code == 200

    def test_blog(self, s):
        r = s.get(f"{API}/blog", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_settings_public(self, s):
        r = s.get(f"{API}/settings/public", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "whatsapp_number" in d

    def test_sitemap(self, s):
        r = s.get(f"{API}/sitemap.xml", timeout=15)
        assert r.status_code == 200
        assert "<urlset" in r.text


# --- Leads ---
class TestLeads:
    created_lead_id = None

    def test_lead_invalid_phone(self, s):
        r = s.post(f"{API}/leads", json={"name": "TEST_bad", "phone": "abc"}, timeout=15)
        assert r.status_code == 422

    def test_lead_empty_name(self, s):
        r = s.post(f"{API}/leads", json={"name": "  ", "phone": "9876543210"}, timeout=15)
        assert r.status_code == 422

    def test_lead_create_success(self, s):
        payload = {
            "name": "TEST_Lead " + uuid.uuid4().hex[:6],
            "phone": "+91 98765 43210",
            "email": "test_lead@example.com",
            "project_name": "Atlantis Grand",
            "message": "TEST: interested in 3 BHK",
            "source": "test",
            "budget": "2 Cr",
            "config_interest": "3 BHK",
        }
        r = s.post(f"{API}/leads", json=payload, timeout=60)  # AI scoring can be slow
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True and d["id"]
        TestLeads.created_lead_id = d["id"]

    def test_lead_persisted_in_admin(self, s, admin_headers):
        assert TestLeads.created_lead_id
        r = s.get(f"{API}/admin/leads", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        ids = [l["id"] for l in r.json()]
        assert TestLeads.created_lead_id in ids


# --- Auth ---
class TestAuth:
    def test_login_wrong(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG_pass_xx"}, timeout=15)
        assert r.status_code == 401

    def test_me_requires_auth(self, s):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_me_with_token(self, s, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_admin_requires_auth(self, s):
        r = requests.get(f"{API}/admin/dashboard", timeout=15)
        assert r.status_code == 401


# --- Admin ---
class TestAdmin:
    created_project_id = None

    def test_dashboard(self, admin_headers):
        r = requests.get(f"{API}/admin/dashboard", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "total_leads" in d and "by_status" in d and "recent_leads" in d

    def test_admin_projects_list(self, admin_headers):
        r = requests.get(f"{API}/admin/projects", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_create_update_delete_project(self, admin_headers):
        new_p = {
            "name": "TEST_Project_" + uuid.uuid4().hex[:6],
            "slug": "test-project-" + uuid.uuid4().hex[:6],
            "status": "UPCOMING", "category": "RESIDENTIAL",
            "city": "Zirakpur", "locality": "Test", "tagline": "orig",
            "description": "test", "configs": [], "featured": False, "sort_order": 999,
        }
        r = requests.post(f"{API}/admin/projects", headers=admin_headers, json=new_p, timeout=15)
        assert r.status_code == 200
        pid = r.json()["id"]
        TestAdmin.created_project_id = pid

        # Update
        upd = dict(r.json()); upd["tagline"] = "updated"
        r2 = requests.put(f"{API}/admin/projects/{pid}", headers=admin_headers, json=upd, timeout=15)
        assert r2.status_code == 200
        assert r2.json()["tagline"] == "updated"

        # Verify persisted
        r3 = requests.get(f"{API}/projects/{new_p['slug']}", timeout=15)
        assert r3.status_code == 200
        assert r3.json()["tagline"] == "updated"

        # Delete
        r4 = requests.delete(f"{API}/admin/projects/{pid}", headers=admin_headers, timeout=15)
        assert r4.status_code == 200
        r5 = requests.get(f"{API}/projects/{new_p['slug']}", timeout=15)
        assert r5.status_code == 404

    def test_admin_leads_list(self, admin_headers):
        r = requests.get(f"{API}/admin/leads", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_lead_stage_update_and_note(self, admin_headers):
        # Create a lead first
        p = {"name": "TEST_stage", "phone": "9876543210", "source": "test"}
        r = requests.post(f"{API}/leads", json=p, timeout=60)
        assert r.status_code == 200
        lid = r.json()["id"]
        # Update stage + note
        r2 = requests.put(f"{API}/admin/leads/{lid}", headers=admin_headers,
                          json={"status": "CONTACTED", "note": "TEST_note_1"}, timeout=15)
        assert r2.status_code == 200
        d = r2.json()
        assert d["status"] == "CONTACTED"
        assert any(n["text"] == "TEST_note_1" for n in d.get("notes", []))
        # Invalid stage
        r3 = requests.put(f"{API}/admin/leads/{lid}", headers=admin_headers,
                          json={"status": "BOGUS"}, timeout=15)
        assert r3.status_code == 422
        # Cleanup
        requests.delete(f"{API}/admin/leads/{lid}", headers=admin_headers, timeout=15)

    def test_settings_update(self, admin_headers):
        r = requests.get(f"{API}/admin/settings", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        settings = r.json()
        settings["whatsapp_default_message"] = "TEST message " + uuid.uuid4().hex[:5]
        r2 = requests.put(f"{API}/admin/settings", headers=admin_headers, json=settings, timeout=15)
        assert r2.status_code == 200
        # Verify via public
        r3 = requests.get(f"{API}/settings/public", timeout=15)
        assert r3.json()["whatsapp_default_message"] == settings["whatsapp_default_message"]


# --- AI ---
class TestAI:
    def test_chat_sse(self, s):
        payload = {"session_id": "test-" + uuid.uuid4().hex[:8], "message": "What 3 BHK options in Zirakpur?"}
        with requests.post(f"{API}/chat", json=payload, stream=True, timeout=60) as r:
            assert r.status_code == 200
            got_token = False
            done = False
            start = time.time()
            for line in r.iter_lines(decode_unicode=True):
                if time.time() - start > 45:
                    break
                if not line:
                    continue
                if line.startswith("data: "):
                    payload = line[6:]
                    if payload == "[DONE]":
                        done = True
                        break
                    try:
                        d = json.loads(payload)
                        if d.get("token"):
                            got_token = True
                    except Exception:
                        pass
            assert got_token, "No token streamed from /api/chat"

    def test_ai_studio_generate(self, admin_headers):
        r = requests.post(f"{API}/admin/ai/generate", headers=admin_headers,
                          json={"kind": "seo", "context": "Atlantis Grand, 3 BHK luxury in Zirakpur"},
                          timeout=60)
        # Allow retry once if 502
        if r.status_code == 502:
            time.sleep(2)
            r = requests.post(f"{API}/admin/ai/generate", headers=admin_headers,
                              json={"kind": "seo", "context": "Atlantis Grand, 3 BHK luxury in Zirakpur"},
                              timeout=60)
        assert r.status_code == 200, r.text
        assert r.json().get("output")


# --- New feature tests (iter 2) ---
class TestNewFeatures:
    def test_pdf_upload(self, admin_headers):
        # Minimal PDF header + EOF
        import base64
        pdf_bytes = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"
        data_url = "data:application/pdf;base64," + base64.b64encode(pdf_bytes).decode()
        r = requests.post(f"{API}/admin/upload", headers=admin_headers,
                          json={"data_url": data_url}, timeout=30)
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        assert url.startswith("/api/uploads/") and url.endswith(".pdf"), url
        # Verify file is downloadable
        full = f"{BASE_URL}{url}"
        r2 = requests.get(full, timeout=30)
        assert r2.status_code == 200
        assert r2.content.startswith(b"%PDF")

    def test_pdf_upload_rejects_other_type(self, admin_headers):
        r = requests.post(f"{API}/admin/upload", headers=admin_headers,
                          json={"data_url": "data:text/plain;base64,aGVsbG8="}, timeout=15)
        assert r.status_code == 422

    def test_lead_stores_email(self, s, admin_headers):
        payload = {
            "name": "TEST_email " + uuid.uuid4().hex[:6],
            "phone": "+91 98111 22233",
            "email": "verify_email_stored@example.com",
            "source": "popup",
        }
        r = s.post(f"{API}/leads", json=payload, timeout=60)
        assert r.status_code == 200
        lid = r.json()["id"]
        r2 = requests.get(f"{API}/admin/leads", headers=admin_headers, timeout=15)
        assert r2.status_code == 200
        match = next((x for x in r2.json() if x["id"] == lid), None)
        assert match is not None
        assert match.get("email") == "verify_email_stored@example.com"
        # cleanup
        requests.delete(f"{API}/admin/leads/{lid}", headers=admin_headers, timeout=15)

    def test_project_videos_documents_persist(self, admin_headers):
        # Read atlantis-grand
        r = requests.get(f"{API}/projects/atlantis-grand", timeout=15)
        assert r.status_code == 200
        proj = r.json()
        pid = proj["id"]
        # Save original to restore
        orig_videos = proj.get("videos") or []
        orig_docs = proj.get("documents") or []
        try:
            proj["videos"] = [{"url": "https://www.youtube.com/watch?v=TEST_VID", "title": "TEST_Vid"}]
            proj["documents"] = [{"name": "TEST_Doc", "url": "https://example.com/test.pdf"}]
            r2 = requests.put(f"{API}/admin/projects/{pid}", headers=admin_headers, json=proj, timeout=20)
            assert r2.status_code == 200, r2.text
            r3 = requests.get(f"{API}/projects/atlantis-grand", timeout=15)
            d = r3.json()
            assert any(v.get("title") == "TEST_Vid" for v in (d.get("videos") or []))
            assert any(x.get("name") == "TEST_Doc" for x in (d.get("documents") or []))
        finally:
            # Restore
            r4 = requests.get(f"{API}/projects/atlantis-grand", timeout=15).json()
            r4["videos"] = orig_videos
            r4["documents"] = orig_docs
            requests.put(f"{API}/admin/projects/{pid}", headers=admin_headers, json=r4, timeout=20)

    def test_project_has_logo_field(self):
        r = requests.get(f"{API}/projects/atlantis-grand", timeout=15)
        assert r.status_code == 200
        d = r.json()
        # logo field should be present (may be empty string but key expected)
        assert "logo" in d or "logo_url" in d, f"No logo field found. Keys: {list(d.keys())[:30]}"

    def test_ready_to_move_status_filter(self):
        r = requests.get(f"{API}/projects?status=READY_TO_MOVE", timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p.get("status") == "READY_TO_MOVE"

