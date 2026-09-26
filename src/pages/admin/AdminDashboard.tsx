import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/ui/Icon';
import { MOCK_QUESTIONS } from '../../data/mockQuestions';
import { getUsers, saveUsers, type UserCredential } from '../../lib/userStore';

type TabId = 'overview' | 'users' | 'round1' | 'round2' | 'round3';

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'users', label: 'User Management', icon: 'manage_accounts' },
    { id: 'round1', label: 'Round 1 (Assessment)', icon: 'assignment' },
    { id: 'round2', label: 'Round 2 (Debug)', icon: 'bug_report' },
    { id: 'round3', label: 'Round 3 (Final)', icon: 'construction' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 flex items-center gap-3">
          <Icon name="admin_panel_settings" className="text-primary text-2xl" filled />
          <h1 className="font-headline-sm font-bold text-on-surface">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-sm font-medium cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <Icon name={tab.icon} filled={activeTab === tab.id} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant/30">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors font-label-md cursor-pointer"
          >
            <Icon name="logout" className="text-lg" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-margin-mobile md:p-margin overflow-y-auto bg-surface relative h-screen">
        <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UserManagementTab />}
          {activeTab === 'round1' && <Round1Tab />}
          {activeTab === 'round2' && <Round2Tab />}
          {activeTab === 'round3' && <Round3Tab />}
        </div>
      </main>
    </div>
  );
}

function OverviewTab() {
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, r1Completed: 0, r2Completed: 0 });

  useEffect(() => {
    try {
      const users = getUsers();
      const r1 = JSON.parse(localStorage.getItem('amscodeathon_submissions_r1') || '[]');
      const r2 = JSON.parse(localStorage.getItem('amscodeathon_submissions_r2') || '[]');

      const uniqueR1 = r1.filter((v: any, i: number, a: any[]) => a.findIndex(t => (t.sessionId && t.sessionId === v.sessionId) || (!t.sessionId && t.submittedAt === v.submittedAt && t.userId === v.userId)) === i);
      const uniqueR2 = r2.filter((v: any, i: number, a: any[]) => a.findIndex(t => (t.sessionId && t.sessionId === v.sessionId) || (!t.sessionId && t.submittedAt === v.submittedAt && t.userId === v.userId)) === i);

      setStats({
        totalUsers: users.length,
        r1Completed: uniqueR1.length,
        r2Completed: uniqueR2.length
      });

      const formattedR1 = uniqueR1.map((s: any) => ({
        id: s.sessionId || Math.random().toString(),
        name: s.userId,
        team: s.teamName,
        round: 'Round 1 (MCQ)',
        score: `${s.correct}/60`,
        submittedAt: s.submittedAt,
        status: 'Completed',
        color: 'text-tertiary', 
        bg: 'bg-tertiary-container/30'
      }));

      const formattedR2 = uniqueR2.map((s: any) => ({
        id: s.sessionId || Math.random().toString(),
        name: s.userId,
        team: s.teamName,
        round: 'Round 2 (Debug)',
        score: `${s.correct}/12`,
        submittedAt: s.submittedAt,
        status: 'Completed',
        color: 'text-primary', 
        bg: 'bg-primary-container/30'
      }));

      const combined = [...formattedR1, ...formattedR2].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5);
      setRecentSubs(combined);
    } catch(e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-headline-md font-bold text-on-surface mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
              <Icon name="group" filled />
            </div>
            <div>
              <p className="text-on-surface-variant font-body-md">Total Candidates</p>
              <p className="text-headline-lg font-bold text-on-surface">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
              <Icon name="assignment_turned_in" filled />
            </div>
            <div>
              <p className="text-on-surface-variant font-body-md">Round 1 Completions</p>
              <p className="text-headline-lg font-bold text-on-surface">{stats.r1Completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/50 text-primary flex items-center justify-center">
              <Icon name="bug_report" filled />
            </div>
            <div>
              <p className="text-on-surface-variant font-body-md">Round 2 Completions</p>
              <p className="text-headline-lg font-bold text-on-surface">{stats.r2Completed}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
          <h2 className="font-headline-md font-bold text-on-surface">Recent Submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant text-label-sm uppercase">
                <th className="p-4 font-label-sm">Candidate Name</th>
                <th className="p-4 font-label-sm">Round</th>
                <th className="p-4 font-label-sm">Score</th>
                <th className="p-4 font-label-sm">Time Submitted</th>
                <th className="p-4 font-label-sm">Status</th>
              </tr>
            </thead>
            <tbody className="text-body-md divide-y divide-outline-variant/20">
              {recentSubs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    <Icon name="inbox" className="text-4xl mb-2 opacity-50" />
                    <p>No submissions recorded yet.</p>
                  </td>
                </tr>
              ) : recentSubs.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-4 font-medium text-on-surface">{row.name}</td>
                  <td className="p-4 font-bold text-on-surface-variant">{row.round}</td>
                  <td className="p-4 text-on-surface-variant font-mono">{row.score}</td>
                  <td className="p-4 text-on-surface-variant text-sm">
                    {new Date(row.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.bg} ${row.color}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserManagementTab() {
  const [users, setUsers] = useState<UserCredential[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<UserCredential>>({});

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleSaveUser = () => {
    let updatedUsers;
    if (currentUser.id) {
      updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, ...currentUser } as UserCredential : u);
    } else {
      const newUser = {
        ...currentUser,
        id: Math.random().toString(36).substr(2, 9),
        isActive: currentUser.isActive ?? true
      } as UserCredential;
      updatedUsers = [...users, newUser];
    }
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setIsEditing(false);
    setCurrentUser({});
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  const handleToggleStatus = (id: string) => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md font-bold text-on-surface">User Management</h2>
        <button 
          onClick={() => { setCurrentUser({ isActive: true }); setIsEditing(true); }}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Icon name="add" />
          Generate Entry Code
        </button>
      </div>
      
      {isEditing && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm mb-6 animate-in fade-in">
          <h3 className="font-headline-sm mb-4">{currentUser.id ? 'Edit User' : 'New User'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface-variant">User ID</label>
              <input 
                type="text" 
                value={currentUser.userId || ''} 
                onChange={e => setCurrentUser({...currentUser, userId: e.target.value})}
                className="w-full p-2.5 bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g. USER-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface-variant">Team Name</label>
              <input 
                type="text" 
                value={currentUser.teamName || ''} 
                onChange={e => setCurrentUser({...currentUser, teamName: e.target.value})}
                className="w-full p-2.5 bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary"
                placeholder="e.g. Code Ninjas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-on-surface-variant">Password</label>
              <input 
                type="text" 
                value={currentUser.password || ''} 
                onChange={e => setCurrentUser({...currentUser, password: e.target.value})}
                className="w-full p-2.5 bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary"
                placeholder="Password"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg cursor-pointer transition-colors font-medium">Cancel</button>
            <button onClick={handleSaveUser} className="px-4 py-2 bg-primary text-on-primary rounded-lg cursor-pointer hover:bg-primary/90 transition-colors font-medium">Save User</button>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant text-label-sm uppercase">
                <th className="p-4 font-label-sm">User ID</th>
                <th className="p-4 font-label-sm">Team Name</th>
                <th className="p-4 font-label-sm">Password</th>
                <th className="p-4 font-label-sm">Status</th>
                <th className="p-4 font-label-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-md">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    <Icon name="group_off" className="text-4xl mb-2 opacity-50" />
                    <p>No candidates found. Create one to allow access.</p>
                  </td>
                </tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-4 font-medium text-on-surface">{user.userId}</td>
                  <td className="p-4 text-on-surface-variant">{user.teamName}</td>
                  <td className="p-4 text-on-surface-variant font-mono text-sm">{user.password}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        user.isActive 
                          ? 'bg-tertiary-container/30 text-tertiary hover:bg-tertiary-container' 
                          : 'bg-error-container text-on-error-container hover:bg-error-container/80'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { setCurrentUser(user); setIsEditing(true); }} 
                      className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container cursor-pointer transition-colors mr-1"
                      title="Edit User"
                    >
                      <Icon name="edit" className="text-xl" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)} 
                      className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-surface-container cursor-pointer transition-colors"
                      title="Delete User"
                    >
                      <Icon name="delete" className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Round1Tab() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('amscodeathon_submissions_r1') || '[]');
      // Deduplicate old entries
      const uniqueData = data.filter((v: any, i: number, a: any[]) => 
        a.findIndex(t => (t.sessionId && t.sessionId === v.sessionId) || (!t.sessionId && t.submittedAt === v.submittedAt && t.userId === v.userId)) === i
      );
      if (uniqueData.length !== data.length) {
        localStorage.setItem('amscodeathon_submissions_r1', JSON.stringify(uniqueData));
      }
      setSubmissions(uniqueData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-headline-md font-bold text-on-surface">Round 1: Assessment Results</h2>
      
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm animate-in fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant text-label-sm uppercase">
                <th className="p-4 font-label-sm">User ID</th>
                <th className="p-4 font-label-sm">Team Name</th>
                <th className="p-4 font-label-sm text-tertiary">Correct</th>
                <th className="p-4 font-label-sm text-error">Wrong</th>
                <th className="p-4 font-label-sm text-primary">Review</th>
                <th className="p-4 font-label-sm text-on-surface-variant">Not Attended</th>
                <th className="p-4 font-label-sm">Submitted At</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-md">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                    <Icon name="assignment" className="text-4xl mb-2 opacity-50" />
                    <p>No submissions yet for Round 1.</p>
                  </td>
                </tr>
              ) : submissions.map((sub, i) => (
                <React.Fragment key={sub.sessionId || i}>
                  <tr 
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === sub.sessionId ? null : sub.sessionId)}
                  >
                    <td className="p-4 font-medium text-on-surface">{sub.userId}</td>
                    <td className="p-4 text-on-surface-variant">{sub.teamName}</td>
                    <td className="p-4 font-bold text-tertiary">{sub.correct}</td>
                    <td className="p-4 font-bold text-error">{sub.wrong}</td>
                    <td className="p-4 font-bold text-primary">{sub.review || 0}</td>
                    <td className="p-4 font-medium text-on-surface-variant">{sub.notAttended}</td>
                    <td className="p-4 text-on-surface-variant text-sm">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <Icon name={expandedId === sub.sessionId ? "expand_less" : "expand_more"} />
                    </td>
                  </tr>
                  {expandedId === sub.sessionId && (
                    <tr className="bg-surface-container-lowest border-b-2 border-primary/20">
                      <td colSpan={8} className="p-6">
                        <h4 className="font-label-md uppercase text-on-surface-variant mb-4 flex items-center gap-2">
                          <Icon name="touch_app" className="text-lg opacity-50" />
                          Click a question to view full details
                        </h4>
                        {!sub.questionDetails ? (
                          <div className="p-4 text-center bg-surface-container rounded-lg text-on-surface-variant">
                            Detailed information is not available for this older submission. Please submit a new test to see details.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {sub.questionDetails.map((qd: any) => {
                              let bgClass = "bg-surface-container-high text-on-surface-variant border-transparent";
                              if (qd.status === 'correct') bgClass = "bg-tertiary-container/40 text-on-surface border-tertiary/30";
                              else if (qd.status === 'wrong') bgClass = "bg-error-container/40 text-on-surface border-error/30";
                              else if (qd.isReview) bgClass = "bg-primary-container/40 text-on-surface border-primary/30";

                              return (
                                <div 
                                  key={qd.questionId} 
                                  className={`flex flex-col p-3 rounded-lg border cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all ${bgClass}`}
                                  onClick={() => setSelectedQuestion(qd)}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">Question {qd.index}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                                      qd.status === 'correct' ? 'bg-tertiary text-on-tertiary' :
                                      qd.status === 'wrong' ? 'bg-error text-on-error' :
                                      qd.isReview ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                                    }`}>
                                      {qd.status === 'not_attended' ? (qd.isReview ? 'REVIEW' : 'SKIPPED') : qd.status}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1 text-xs mt-1">
                                    <div className="flex justify-between">
                                      <span className="opacity-70">Selected:</span>
                                      <span className="font-mono font-bold">{qd.selected || '--'}</span>
                                    </div>
                                    {qd.correctOption && (
                                      <div className="flex justify-between">
                                        <span className="opacity-70">Correct Answer:</span>
                                        <span className="font-mono font-bold text-tertiary">{qd.correctOption}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuestion && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low rounded-t-xl">
              <div>
                <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                  Question {selectedQuestion.index}
                  <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                    selectedQuestion.status === 'correct' ? 'bg-tertiary text-on-tertiary' :
                    selectedQuestion.status === 'wrong' ? 'bg-error text-on-error' :
                    selectedQuestion.isReview ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {selectedQuestion.status === 'not_attended' ? (selectedQuestion.isReview ? 'REVIEW' : 'SKIPPED') : selectedQuestion.status}
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setSelectedQuestion(null)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
              >
                <Icon name="close" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {(() => {
                const originalQuestion = MOCK_QUESTIONS.find(q => q.id === selectedQuestion.questionId);
                if (!originalQuestion) return <div>Question data not found.</div>;
                
                return (
                  <>
                    <div className="text-body-lg text-on-surface font-medium p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-sm">
                      {originalQuestion.question}
                    </div>
                    
                    <div className="space-y-3 mt-2">
                      <h4 className="font-label-md uppercase text-on-surface-variant">Options</h4>
                      {originalQuestion.options.map((opt) => {
                        const isSelected = selectedQuestion.selected === opt.id;
                        const isCorrect = selectedQuestion.correctOption === opt.id;
                        
                        let borderClass = "border-outline-variant/30 bg-surface-container-low opacity-60";
                        let icon = null;
                        
                        if (isSelected && isCorrect) {
                          borderClass = "border-tertiary bg-tertiary-container/30 ring-1 ring-tertiary text-on-surface";
                          icon = <Icon name="check_circle" className="text-tertiary" filled />;
                        } else if (isSelected && !isCorrect) {
                          borderClass = "border-error bg-error-container/30 ring-1 ring-error text-on-surface";
                          icon = <Icon name="cancel" className="text-error" filled />;
                        } else if (isCorrect) {
                          borderClass = "border-tertiary bg-tertiary-container/10 border-dashed text-on-surface";
                          icon = <Icon name="check" className="text-tertiary" />;
                        }
                        
                        return (
                          <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${borderClass}`}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm shrink-0 bg-surface border border-outline-variant/30 shadow-sm">
                              {opt.id}
                            </div>
                            <div className="flex-1 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                              {opt.text}
                            </div>
                            {icon && <div className="shrink-0 ml-2">{icon}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Round2Tab() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("C++");

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('amscodeathon_submissions_r2') || '[]');
      // Deduplicate old entries
      const uniqueData = data.filter((v: any, i: number, a: any[]) => 
        a.findIndex(t => (t.sessionId && t.sessionId === v.sessionId) || (!t.sessionId && t.submittedAt === v.submittedAt && t.userId === v.userId)) === i
      );
      if (uniqueData.length !== data.length) {
        localStorage.setItem('amscodeathon_submissions_r2', JSON.stringify(uniqueData));
      }
      setSubmissions(uniqueData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-headline-md font-bold text-on-surface">Round 2: Debugging Results</h2>
      
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm animate-in fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant text-label-sm uppercase">
                <th className="p-4 font-label-sm">User ID</th>
                <th className="p-4 font-label-sm">Team Name</th>
                <th className="p-4 font-label-sm text-tertiary">Correct</th>
                <th className="p-4 font-label-sm text-error">Wrong</th>
                <th className="p-4 font-label-sm text-primary">Review</th>
                <th className="p-4 font-label-sm text-on-surface-variant">Not Attended</th>
                <th className="p-4 font-label-sm">Submitted At</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-md">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                    <Icon name="bug_report" className="text-4xl mb-2 opacity-50" />
                    <p>No submissions yet for Round 2.</p>
                  </td>
                </tr>
              ) : submissions.map((sub, i) => (
                <React.Fragment key={sub.sessionId || i}>
                  <tr 
                    className="hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === sub.sessionId ? null : sub.sessionId)}
                  >
                    <td className="p-4 font-medium text-on-surface">{sub.userId}</td>
                    <td className="p-4 text-on-surface-variant">{sub.teamName}</td>
                    <td className="p-4 font-bold text-tertiary">{sub.correct}</td>
                    <td className="p-4 font-bold text-error">{sub.wrong}</td>
                    <td className="p-4 font-bold text-primary">0</td>
                    <td className="p-4 font-medium text-on-surface-variant">{sub.notAttended}</td>
                    <td className="p-4 text-on-surface-variant text-sm">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <Icon name={expandedId === sub.sessionId ? "expand_less" : "expand_more"} />
                    </td>
                  </tr>
                  {expandedId === sub.sessionId && (
                    <tr className="bg-surface-container-lowest border-b-2 border-primary/20">
                      <td colSpan={8} className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-label-md uppercase text-on-surface-variant flex items-center gap-2">
                            <Icon name="touch_app" className="text-lg opacity-50" />
                            Click a question to view full details
                          </h4>
                          <div className="flex bg-surface-container rounded-lg p-1 shadow-inner">
                            {["C++", "Python", "Java"].map(lang => (
                              <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                                  selectedLanguage === lang 
                                    ? "bg-primary text-on-primary shadow-sm" 
                                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                                }`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                        {!sub.questionDetails ? (
                          <div className="p-4 text-center bg-surface-container rounded-lg text-on-surface-variant">
                            Detailed information is not available for this older submission. Please submit a new test to see details.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {sub.questionDetails
                              .filter((qd: any) => !qd.language || qd.language === selectedLanguage)
                              .map((qd: any) => {
                              let bgClass = "bg-surface-container-high text-on-surface-variant border-transparent";
                              if (qd.status === 'correct') bgClass = "bg-tertiary-container/40 text-on-surface border-tertiary/30";
                              else if (qd.status === 'wrong') bgClass = "bg-error-container/40 text-on-surface border-error/30";

                              return (
                                <div 
                                  key={`${qd.questionId}-${qd.language || 'legacy'}`} 
                                  className={`flex flex-col p-3 rounded-lg border cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all ${bgClass}`}
                                  onClick={() => setSelectedQuestion(qd)}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">Question {qd.index}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                                      qd.status === 'correct' ? 'bg-tertiary text-on-tertiary' : 'bg-surface-variant text-on-surface-variant'
                                    }`}>
                                      {qd.status === 'not_attended' ? 'NOT ATTENDED' : 'EDITED'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-col gap-1 text-xs mt-1">
                                    <div className="flex justify-between">
                                      <span className="opacity-70">Task:</span>
                                      <span className="font-mono font-bold line-clamp-1" title={qd.title}>{qd.title || '--'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="opacity-70">Status:</span>
                                      <span className={`font-mono font-bold ${qd.status === 'correct' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                                        {qd.status === 'correct' ? 'Modified' : 'Unchanged'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuestion && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low rounded-t-xl">
              <div>
                <h3 className="font-headline-sm font-bold text-on-surface flex items-center gap-2">
                  Question {selectedQuestion.index}
                  <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                    selectedQuestion.status === 'correct' ? 'bg-tertiary text-on-tertiary' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {selectedQuestion.status === 'not_attended' ? 'NOT ATTENDED' : 'EDITED'}
                  </span>
                </h3>
                <p className="text-sm text-on-surface-variant">{selectedQuestion.title}</p>
              </div>
              <button 
                onClick={() => setSelectedQuestion(null)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
              >
                <Icon name="close" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {!selectedQuestion.submittedCode ? (
                <div className="p-8 bg-surface-container rounded-lg text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
                  <Icon name="code_off" className="text-4xl opacity-50" />
                  Code data is not available for this legacy submission. Please take the test again.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-label-md uppercase text-on-surface-variant flex items-center gap-2">
                      <Icon name="history_edu" className="text-primary" />
                      Candidate's Submitted Code
                    </h4>
                    <div className="bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto border border-outline-variant/30 shadow-inner h-[50vh]">
                      <pre className="text-sm font-mono text-[#d4d4d4] whitespace-pre-wrap">
                        {selectedQuestion.submittedCode}
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-label-md uppercase text-on-surface-variant flex items-center gap-2">
                      <Icon name="code" className="text-on-surface-variant" />
                      Initial Provided Code
                    </h4>
                    <div className="bg-surface-container-low p-4 rounded-lg overflow-x-auto border border-outline-variant/30 shadow-inner h-[50vh]">
                      <pre className="text-sm font-mono text-on-surface-variant whitespace-pre-wrap">
                        {selectedQuestion.initialCode}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Round3Tab() {
  return (
    <div className="space-y-6 h-[80vh] flex flex-col items-center justify-center animate-in fade-in">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
        <Icon name="construction" className="text-7xl text-primary relative z-10" />
      </div>
      <h2 className="font-headline-lg font-bold text-on-surface mt-6 mb-2">Round 3 Under Construction</h2>
      <p className="text-on-surface-variant text-center max-w-md">
        The final round challenge is currently being built. Check back soon for updates.
      </p>
      
      <div className="mt-8 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
