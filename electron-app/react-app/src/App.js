import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
  Outlet
} from 'react-router-dom';

import AccountSelection from './pages/AccountSelection';
import Test from './pages/Test';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateNewAccount from './pages/CreateNewAccount';
import VideoPlayer from './components/VideoPlayer';
import ChapterPage from './pages/ChapterPage';

function Layout() {
  return (
    <div className="app">
      <Outlet /> {/* This renders matched child routes */}
    </div>
  );
}

// 2. Define your router with loaders
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <AccountSelection />,
      },
      {
        path: '/account/0',
        element: <CreateNewAccount />,
      },
      {
        path: 'account/teacher',
        element: <TeacherDashboard />,
        // Add loader if teacher needs data:
        // loader: async () => {
        //   return await window.api.getTeacherData();
        // }
      },
      // {
      //   path: '/account/:id',
      //   element: <StudentDashboard />,
      //   loader: async ({ params }) => {
      //     try {
      //       const [chapters, progress] = await Promise.all([
      //         window.api.getChapters(),
      //         window.api.getChapterProgress(params.id)
      //       ]);
      //       return { chapters, progress };
      //     } catch (error) {
      //       console.error('Loader error:', error);
      //       throw new Response('Not Found', { status: 404 });
      //     }
      //   }
      // }
      {
        path: '/account/:id',
        element: <StudentDashboard />,
        loader: async ({ params, request }) => {
          try {
            // // 1. Check if navigation state contains account data
            // const url = new URL(request.url);
            // const state = url.state || {}; // Fallback to empty object

            // // 2. If progress data was passed via navigation state, use it
            // if (state.progress) {
            //   const chapters = await window.api.getChapters();
            //   return { chapters, progress: state.progress };
            // }

            // 3. Otherwise, fetch everything fresh
            const [account, chapters, progress] = await Promise.all([
              window.api.getAccount(params.id),
              window.api.getChapters(),
              window.api.getChapterProgress(params.id)
            ]);

            return { account, chapters, progress };
          } catch (error) {
            console.error('Loader error:', error);
            throw new Response('Not Found', { status: 404 });
          }
        }
      },
      {
        path: '/account/:id/settings',
        element: <div><p>Settings</p></div>
      },
      {
        path: '/account/:id/chapter/:num',
        element: <ChapterPage />,
        loader: ({params}) => {
          return {chapterNumber: params.num,
            userId: params.id
          };
        }
      }
    ]
  }
]);

// 3. Replace your old App component
function App() {
  return <RouterProvider router={router} />;
}

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<AccountSelection />} />
//         <Route path="/account/0" element={<CreateNewAccount />} />
//         <Route path="account/teacher" element={<TeacherDashboard />}/>
//         <Route path="/account/:id" element={<StudentDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

export default App;