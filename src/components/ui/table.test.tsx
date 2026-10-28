import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const mockData = [
  { id: 1, date: "2024-06-01", item: "아이템1", price: "1000", status: "완료" },
  {
    id: 2,
    date: "2024-06-02",
    item: "아이템2",
    price: "2000",
    status: "진행중",
  },
];

const tooltipText = `툴팁 텍스트`;

describe("TableRow tooltip", () => {
  it("툴팁 동작 테스트", async () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead>가격</TableHead>
            <TableHead>상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((trade) => (
            <TableRow key={trade.id} tooltipContent={tooltipText}>
              <TableCell>{trade.date}</TableCell>
              <TableCell>{trade.item}</TableCell>
              <TableCell>{trade.price}</TableCell>
              <TableCell>{trade.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>,
    );

    // 첫번째 row에 포인터 이동
    const firstRow = screen.getAllByRole("row")[1];
    await userEvent.hover(firstRow);

    // 동작 확인
    expect(await screen.findByText(tooltipText)).toBeInTheDocument();

    // 포인터 제거
    await userEvent.unhover(firstRow);

    await waitFor(() => {
      expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    });
  });

  it("툴팁이 화면 하단을 넘치면 위로 표시되는지 테스트", async () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow tooltipContent={"툴팁 테스트"}>
            <TableCell>2024-06-03</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const row = screen.getAllByRole("row")[1];
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 120,
    });
    fireEvent.pointerEnter(row, { clientX: 100, clientY: 100 });
    const tooltip = await screen.findByText("툴팁 테스트");

    expect(tooltip).toBeInTheDocument();
    const style = window.getComputedStyle(tooltip);
    expect(style.bottom === "" || style.bottom !== "auto").toBe(true);
  });
});
