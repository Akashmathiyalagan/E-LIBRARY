import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

function OpenBookPage() {
  const { bookId } = useParams();
  const [bookContent, setBookContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      axios.get(`/api/book/content/${bookId}`)
        .then((response) => {
          setBookContent(response.data.content);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching book content:", error);
        });
    }
  }, [bookId]);

  if (loading) return <div>Loading...</div>;
  if (!bookContent) return <div>Book content not found!</div>;

  return (
    <div>
      <h1>Book Content</h1>
      <p>{bookContent}</p>
    </div>
  );
}

export default OpenBookPage;
