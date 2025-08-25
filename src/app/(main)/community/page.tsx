import List from "@/components/page/community/List";
import PageTitle from "@/components/commons/PageTitle";

function CommunityPage() {
  return (
    <main className="flex flex-col gap-8">
      <PageTitle title="커뮤니티" />
      <List />
    </main>
  );
}

export default CommunityPage;
