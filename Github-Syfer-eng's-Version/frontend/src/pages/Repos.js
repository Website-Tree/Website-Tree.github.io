import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Repos = () => {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    const fetchRepos = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/repos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRepos(response.data);
    };
    fetchRepos();
  }, []);

  return (
    <div>
      <h1>Repositories</h1>
      <ul>
        {repos.map((repo) => (
          <li key={repo._id}>{repo.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Repos;
